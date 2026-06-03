'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, FolderUp, FileArchive, RefreshCw, FileCode } from 'lucide-react';
import JSZip from 'jszip';
import { shouldIncludeFile } from '@/lib/repo';

interface CodeScriptChatProps {
  projectId: string;
  clientId: string;
  clientName: string;
  currentScript: string;
  onScriptDraft: (script: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  filesRead?: string[];
}

interface RepoStatus {
  repoLabel: string | null;
  repoSource: string | null;
  repoSyncedAt: string | null;
  fileCount: number;
}

// Send the extracted files to the server in size-bounded batches so each
// request stays well under the serverless body limit.
const BATCH_BYTES = 2_500_000;

export default function CodeScriptChat({
  projectId,
  clientId,
  clientName,
  currentScript,
  onScriptDraft,
}: CodeScriptChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [repo, setRepo] = useState<RepoStatus | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Always read the latest editor content at send time, even though the prop
  // value is captured in closures.
  const scriptRef = useRef(currentScript);
  useEffect(() => {
    scriptRef.current = currentScript;
  }, [currentScript]);

  const loadRepoStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/repo/upload?clientId=${clientId}`);
      if (res.ok) setRepo(await res.json());
    } catch (e) {
      console.error('Error loading repo status:', e);
    }
  }, [clientId]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadRepoStatus();
      try {
        const res = await fetch(`/api/script-chat?projectId=${projectId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (e) {
        console.error('Error loading chat history:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId, loadRepoStatus]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // ---- Upload (folder picker / zip) -------------------------------------

  const uploadFiles = async (
    files: { path: string; content: string }[],
    label: string,
    source: 'folder' | 'zip'
  ) => {
    if (files.length === 0) {
      setUploadError('No readable source files were found.');
      return;
    }

    // Build size-bounded batches.
    const batches: { path: string; content: string }[][] = [];
    let current: { path: string; content: string }[] = [];
    let bytes = 0;
    for (const f of files) {
      const size = f.content.length;
      if (current.length > 0 && bytes + size > BATCH_BYTES) {
        batches.push(current);
        current = [];
        bytes = 0;
      }
      current.push(f);
      bytes += size;
    }
    if (current.length > 0) batches.push(current);

    let uploaded = 0;
    for (let i = 0; i < batches.length; i++) {
      const body: Record<string, unknown> = { clientId, files: batches[i] };
      if (i === 0) {
        body.clear = true;
        body.label = label;
        body.source = source;
      }
      if (i === batches.length - 1) body.final = true;

      const res = await fetch('/api/repo/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }
      uploaded += batches[i].length;
      setUploadProgress(`Uploading ${uploaded}/${files.length} files…`);
    }
  };

  const handleFolderSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setUploadError(null);
    setUploadProgress('Reading folder…');
    try {
      const arr = Array.from(fileList);
      const label = arr[0]?.webkitRelativePath?.split('/')[0] || 'folder';
      const out: { path: string; content: string }[] = [];
      for (const file of arr) {
        const path = file.webkitRelativePath || file.name;
        if (!shouldIncludeFile(path, file.size)) continue;
        const content = await file.text();
        out.push({ path, content });
      }
      await uploadFiles(out, label, 'folder');
      await loadRepoStatus();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to read folder');
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (folderInputRef.current) folderInputRef.current.value = '';
    }
  };

  const handleZipSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    setUploadProgress('Unpacking zip…');
    try {
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      const out: { path: string; content: string }[] = [];
      const entries = Object.values(zip.files).filter((z) => !z.dir);
      for (const entry of entries) {
        const content = await entry.async('string');
        // shouldIncludeFile re-checks the size; use the decoded length.
        if (!shouldIncludeFile(entry.name, content.length)) continue;
        out.push({ path: entry.name, content });
      }
      const label = file.name.replace(/\.zip$/i, '');
      await uploadFiles(out, label, 'zip');
      await loadRepoStatus();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to read zip');
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (zipInputRef.current) zipInputRef.current.value = '';
    }
  };

  // ---- Chat --------------------------------------------------------------

  const sendMessage = async () => {
    const text = inputMessage.trim();
    if (!text || sending) return;

    const tempId = 'temp-' + messages.length;
    setMessages((prev) => [...prev, { id: tempId, role: 'user', content: text }]);
    setInputMessage('');
    setSending(true);

    try {
      const res = await fetch('/api/script-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          message: text,
          currentScript: scriptRef.current,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to send message');
      }
      const data = await res.json();

      if (typeof data.scriptDraft === 'string' && data.scriptDraft.length > 0) {
        onScriptDraft(data.scriptDraft);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: data.assistantMessage.id,
          role: 'assistant',
          content: data.assistantMessage.content,
          filesRead: data.assistantMessage.filesRead || data.filesRead || [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + messages.length,
          role: 'assistant',
          content:
            err instanceof Error
              ? `⚠️ ${err.message}`
              : '⚠️ Something went wrong sending that message.',
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const hasRepo = !!repo && repo.fileCount > 0;

  // ---- Render ------------------------------------------------------------

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="border-b border-gray-200 p-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center min-w-0">
          <FileCode className="w-4 h-4 text-primary-600 mr-2 flex-shrink-0" />
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            Script chat · {clientName}
          </h3>
        </div>
        {hasRepo && (
          <button
            onClick={() => folderInputRef.current?.click()}
            disabled={uploading}
            title="Re-sync code (replaces uploaded files)"
            className="text-xs text-gray-500 hover:text-primary-600 flex items-center disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${uploading ? 'animate-spin' : ''}`} />
            Re-sync
          </button>
        )}
      </div>

      {/* Repo status / connect bar */}
      {!loading && (
        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex-shrink-0">
          {hasRepo ? (
            <div className="text-xs text-gray-600 flex items-center">
              <FolderUp className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
              <span className="truncate">
                {repo!.repoLabel || 'repo'} · {repo!.fileCount} files
              </span>
            </div>
          ) : (
            <div>
              <p className="text-xs text-gray-600 mb-2">
                Connect the code so Claude can read it. Files are read in your browser and stored
                privately — no GitHub token needed.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => folderInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 flex items-center justify-center text-xs px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                >
                  <FolderUp className="w-3.5 h-3.5 mr-1.5" />
                  Upload folder
                </button>
                <button
                  onClick={() => zipInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 flex items-center justify-center text-xs px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  <FileArchive className="w-3.5 h-3.5 mr-1.5" />
                  Upload .zip
                </button>
              </div>
            </div>
          )}
          {(uploading || uploadProgress) && (
            <p className="text-xs text-primary-600 mt-1.5">{uploadProgress || 'Working…'}</p>
          )}
          {uploadError && <p className="text-xs text-red-600 mt-1.5">{uploadError}</p>}
        </div>
      )}

      {/* Hidden file inputs. webkitdirectory enables folder selection. */}
      <input
        ref={folderInputRef}
        type="file"
        // @ts-expect-error non-standard but widely supported folder-select attrs
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        onChange={handleFolderSelected}
      />
      <input
        ref={zipInputRef}
        type="file"
        accept=".zip,application/zip"
        className="hidden"
        onChange={handleZipSelected}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-xs text-gray-500 p-2">
            {hasRepo
              ? 'Tell me what the video should cover. I\'ll read the relevant code and we can shape the script together — then I\'ll write the draft straight into the editor on the right.'
              : 'Connect the code above to get started.'}
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-2.5 rounded-lg ${
                  m.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                {m.filesRead && m.filesRead.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {m.filesRead.map((f) => (
                      <span
                        key={f}
                        title={f}
                        className="inline-flex items-center text-[10px] bg-white/70 text-gray-600 border border-gray-200 rounded px-1.5 py-0.5 max-w-[160px] truncate"
                      >
                        <FileCode className="w-2.5 h-2.5 mr-1 flex-shrink-0" />
                        {f.split('/').pop()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse w-2 h-2 bg-gray-400 rounded-full" />
                <div className="animate-pulse w-2 h-2 bg-gray-400 rounded-full" style={{ animationDelay: '0.2s' }} />
                <div className="animate-pulse w-2 h-2 bg-gray-400 rounded-full" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-3 flex-shrink-0">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={hasRepo ? 'Discuss the script…' : 'Connect the code first…'}
            className="flex-1 input-field text-sm"
            disabled={sending || !hasRepo}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !hasRepo || !inputMessage.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
