'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Client, Project } from '@/lib/types';

import { Plus, Users, X, LogOut, FileText, Search, Trash2, RefreshCw, Video, ArrowLeft, GitBranch } from 'lucide-react';
import AuthForm from '@/components/AuthForm';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const loading = status === 'loading';
  const [showClientModal, setShowClientModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [currentView, setCurrentView] = useState<'clients' | 'projects' | 'project-detail' | 'script-maintenance'>('clients');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [clientForm, setClientForm] = useState({
    name: '',
    description: ''
  });
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: ''
  });
  // The editor still tracks a transient "generated script" slot; it stays empty
  // now that docs-based generation is gone, but the editor logic reads it.
  const [generatedScript, setGeneratedScript] = useState('');
  const [modificationRequest, setModificationRequest] = useState('');
  const [editableScript, setEditableScript] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savingScript, setSavingScript] = useState(false);
  
  // Suggested-edit overlays (queued by the daily repo check) for review.
  const [scriptWithOverlays, setScriptWithOverlays] = useState<string>('');
  const [activeOverlays, setActiveOverlays] = useState<any[]>([]);

  // Partial regeneration states
  const [selectedText, setSelectedText] = useState('');
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [isPartiallyRegenerating, setIsPartiallyRegenerating] = useState(false);
  const [showRegenerateButton, setShowRegenerateButton] = useState(false);
  const [regenerationComplete, setRegenerationComplete] = useState(false);

  // Refs for scroll synchronization
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Repo-release monitoring modal (GitHub feature-doc → automatic script updates)
  const [showRepoWatchModal, setShowRepoWatchModal] = useState(false);
  const [repoWatchLoaded, setRepoWatchLoaded] = useState(false);
  const [repoWatchTokenConfigured, setRepoWatchTokenConfigured] = useState(false);
  const [repoWatchActive, setRepoWatchActive] = useState(false);
  const [savingRepoWatch, setSavingRepoWatch] = useState(false);
  const [repoWatchMessage, setRepoWatchMessage] = useState<string | null>(null);
  const [rwOwner, setRwOwner] = useState('bimobject');
  const [rwName, setRwName] = useState('bim-dictionary');
  const [rwBranch, setRwBranch] = useState('main');
  const [rwDocsPath, setRwDocsPath] = useState('docs/features');
  const [repoRuns, setRepoRuns] = useState<Array<{ id: string; started_at: string; status: string; summary: string | null }>>([]);

  // Deep-link processing guard — fires once after initial data load
  const deepLinkProcessedRef = useRef(false);

  // Overlays in the 'accepted' (awaiting-recording) state for the currently
  // selected project. Loaded in project-detail view so the green highlights
  // appear behind the script editor itself (not just in Script Maintenance).
  const [acceptedOverlays, setAcceptedOverlays] = useState<any[]>([]);

  useEffect(() => {
    if (session?.user) {
      // Load clients and projects from database
      loadUserData();
    } else {
      setClients([]);
      setProjects([]);
    }
  }, [session]);

  // Deep-link: if the URL has ?projectId=…, navigate straight to that project
  // once clients + projects have loaded. Used by digest email links.
  useEffect(() => {
    if (deepLinkProcessedRef.current) return;
    if (clients.length === 0 || projects.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    const targetProjectId = params.get('projectId');
    if (!targetProjectId) {
      deepLinkProcessedRef.current = true;
      return;
    }

    const project = projects.find(p => p.id === targetProjectId);
    if (!project) {
      deepLinkProcessedRef.current = true;
      return;
    }
    const client = clients.find(c => c.id === project.clientId);
    if (!client) {
      deepLinkProcessedRef.current = true;
      return;
    }

    setSelectedClient(client);
    setSelectedProject(project);
    setCurrentView('project-detail');
    deepLinkProcessedRef.current = true;
    // Clean the URL so refresh doesn't re-navigate
    window.history.replaceState({}, '', window.location.pathname);
  }, [clients, projects]);

  const loadUserData = async () => {
    try {
      // Load clients
      const clientsResponse = await fetch('/api/clients');
      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json();
        setClients(clientsData.clients || []);
      }

      // Load projects
      const projectsResponse = await fetch('/api/projects');
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.projects || []);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name.trim() || !clientForm.description.trim()) return;

    try {
      const clientData = {
        name: clientForm.name.trim(),
        company: clientForm.description.trim(),
        email: ''
      };

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });

      if (response.ok) {
        const data = await response.json();
        setClients(prev => [...prev, data.client]);
        setClientForm({ name: '', description: '' });
        setShowClientModal(false);
      }
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    // Check if client has projects
    const clientProjects = getClientProjects(clientId);
    if (clientProjects.length > 0) {
      if (!confirm(`This client has ${clientProjects.length} project(s). Deleting the client will also delete all their projects. Are you sure?`)) {
        return;
      }
    } else {
      if (!confirm('Are you sure you want to delete this client?')) {
        return;
      }
    }

    try {
      const response = await fetch(`/api/clients?id=${clientId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setClients(prev => prev.filter(c => c.id !== clientId));
        // Also remove all projects for this client
        setProjects(prev => prev.filter(p => p.clientId !== clientId));
      }
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects?id=${projectId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        // If we're currently viewing this project, go back to projects view
        if (selectedProject?.id === projectId) {
          setCurrentView('projects');
          setSelectedProject(null);
        }
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title.trim() || !projectForm.description.trim() || !selectedClient) return;
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient.id,
          title: projectForm.title.trim(),
          description: projectForm.description.trim(),
          documentationUrls: [],
          prompt: '',
          status: 'planning',
          sourceType: 'code'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(prev => [...prev, data.project]);
        setProjectForm({ title: '', description: '' });
        setShowProjectModal(false);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setCurrentView('projects');
  };

  const openRepoWatchModal = async () => {
    if (!selectedClient) return;
    setRepoWatchMessage(null);
    setRepoWatchLoaded(false);
    setShowRepoWatchModal(true);
    try {
      const res = await fetch(`/api/repo-watch?clientId=${selectedClient.id}`);
      const data = await res.json();
      if (res.ok) {
        setRepoWatchTokenConfigured(!!data.tokenConfigured);
        setRepoRuns(Array.isArray(data.recentRuns) ? data.recentRuns : []);
        if (data.watch) {
          setRwOwner(data.watch.owner);
          setRwName(data.watch.name);
          setRwBranch(data.watch.branch);
          setRwDocsPath(data.watch.docs_path);
          setRepoWatchActive(!!data.watch.enabled);
        } else {
          setRepoWatchActive(false);
        }
      }
    } catch (error) {
      console.error('Load repo watch error:', error);
    } finally {
      setRepoWatchLoaded(true);
    }
  };

  const handleSaveRepoWatch = async (enabled: boolean) => {
    if (!selectedClient || !rwOwner.trim() || !rwName.trim()) return;
    setSavingRepoWatch(true);
    setRepoWatchMessage(null);
    try {
      const res = await fetch('/api/repo-watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient.id,
          owner: rwOwner.trim(),
          name: rwName.trim(),
          branch: rwBranch.trim(),
          docsPath: rwDocsPath.trim(),
          enabled,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRepoWatchMessage(`❌ ${data.error || 'Failed to save'}`);
        return;
      }
      setRepoWatchActive(enabled);
      setRepoWatchMessage(
        enabled
          ? '✅ Repo updates are on. The daily check will watch this repo from now on.'
          : '✅ Repo updates paused.'
      );
    } catch (error) {
      setRepoWatchMessage(`❌ ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSavingRepoWatch(false);
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('project-detail');
  };

  // Load existing project data when project is selected
  useEffect(() => {
    const loadProjectData = async () => {
      if (selectedProject && currentView === 'project-detail') {
        // Fetch the latest project data from the database to ensure we have the most recent scraped content
        try {
          const response = await fetch(`/api/projects/${selectedProject.id}`);
          if (response.ok) {
            const data = await response.json();
            const latestProject = data.project;
            setSelectedProject(latestProject);
            setGeneratedScript('');
            setEditableScript(latestProject.script || '');
            setHasUnsavedChanges(false);
          } else {
            setGeneratedScript('');
            setEditableScript(selectedProject.script || '');
            setHasUnsavedChanges(false);
          }
        } catch (error) {
          console.error('Error loading project data:', error);
          setGeneratedScript('');
          setEditableScript(selectedProject.script || '');
          setHasUnsavedChanges(false);
        }
      }
    };

    loadProjectData();
  }, [selectedProject?.id, currentView]);

  // When entering Script Maintenance, auto-load any persisted suggested edits
  // produced by the daily cron so they appear in the existing overlay UI
  // without the user having to manually re-run "Check Updates".
  useEffect(() => {
    if (currentView !== 'script-maintenance' || !selectedProject?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/pending-edits?projectId=${selectedProject.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data.overlays || data.overlays.length === 0) return;
        initializeScriptWithOverlays(data.overlays);
      } catch (e) {
        console.error('Failed to load persisted overlays:', e);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView, selectedProject?.id]);

  // In project-detail, load only the accepted (awaiting-recording) overlays
  // so the green highlights render behind the script editor textarea.
  useEffect(() => {
    if (currentView !== 'project-detail' || !selectedProject?.id) {
      setAcceptedOverlays([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/pending-edits?projectId=${selectedProject.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data.overlays) return;
        setAcceptedOverlays(data.overlays.filter((o: any) => o.status === 'accepted'));
      } catch (e) {
        console.error('Failed to load accepted overlays for project-detail:', e);
      }
    })();
    return () => { cancelled = true; };
  }, [currentView, selectedProject?.id]);

  const handleBackToClients = () => {
    setCurrentView('clients');
    setSelectedClient(null);
  };

  const handleBackToProjects = () => {
    setCurrentView('projects');
    setSelectedProject(null);

    // Clear project detail + review state
    setGeneratedScript('');
    setEditableScript('');
    setHasUnsavedChanges(false);
    setModificationRequest('');
    setScriptWithOverlays('');
    setActiveOverlays([]);
  };

  const handleOpenScriptMaintenance = () => {
    setCurrentView('script-maintenance');
  };

  const handleBackToProjectDetail = () => {
    setCurrentView('project-detail');
    setScriptWithOverlays('');
    setActiveOverlays([]);
  };

  const getClientProjects = (clientId: string) => {
    return projects.filter(p => p.clientId === clientId);
  };

  const handlePartialRegenerate = async () => {
    if (!selectedProject?.script || !modificationRequest.trim() || !selectedText) return;
    
    setIsPartiallyRegenerating(true);
    setShowRegenerateButton(false);
    
    let result: any = null;
    try {
      const currentScript = editableScript || selectedProject.script;
      
      // Get context around the selection (200 chars before and after)
      const beforeContext = currentScript.substring(Math.max(0, selectionStart - 200), selectionStart);
      const afterContext = currentScript.substring(selectionEnd, Math.min(currentScript.length, selectionEnd + 200));
      
      const response = await fetch('/api/regenerate-partial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProject.id,
          currentScript: currentScript,
          selectedText: selectedText,
          beforeContext: beforeContext,
          afterContext: afterContext,
          selectionStart: selectionStart,
          selectionEnd: selectionEnd,
          modificationRequest: modificationRequest,
        }),
      });

      result = await response.json();

      if (result.success) {

        // Update the editable script with the new complete script.
        // The API persists this splice, so there are no unsaved changes.
        setEditableScript(result.newCompleteScript);
        setSelectedProject(prev => prev ? { ...prev, script: result.newCompleteScript } : null);
        setHasUnsavedChanges(false);
        setModificationRequest('');
        
        // Update selection to match the actual regenerated text
        const regeneratedLength = result.regeneratedText.length;
        const newSelectionEnd = selectionStart + regeneratedLength;
        
        // Update selection state to match the newly regenerated portion
        setSelectedText(result.regeneratedText);
        setSelectionEnd(newSelectionEnd);
        
        // Show completion state briefly
        setIsPartiallyRegenerating(false);
        setRegenerationComplete(true);
        
        
        // Clear selection after showing completion for 2 seconds
        setTimeout(() => {
          setRegenerationComplete(false);
          setSelectedText('');
          setSelectionStart(0);
          setSelectionEnd(0);
          setShowRegenerateButton(false);
        }, 2000);
      } else {
        console.error('❌ Partial regeneration failed:', result.error);
        alert('❌ Partial regeneration failed: ' + result.error);
      }
    } catch (error) {
      console.error('Partial regeneration error:', error);
      alert('❌ Error during partial regeneration. Please try again.');
    } finally {
      if (!result?.success) {
        setIsPartiallyRegenerating(false);
      }
    }
  };

  const renderTextWithHighlight = (text: string) => {
    if (!text) return '';

    // Escape HTML to prevent XSS
    const escapeHtml = (unsafe: string) => unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .replace(/\n/g, "<br>");

    // Collect every range we want to highlight. Two kinds:
    //   - green spans for each 'accepted' (awaiting-recording) overlay
    //   - the active partial-regen single range (if regenerating)
    type Range = { start: number; end: number; style: string };
    const ranges: Range[] = [];

    for (const overlay of acceptedOverlays) {
      const matchText = overlay.suggested_replacement;
      if (!matchText) continue;
      const idx = text.indexOf(matchText);
      if (idx === -1) continue;
      ranges.push({
        start: idx,
        end: idx + matchText.length,
        // Pale green bg + green underline; text color stays transparent
        // (inherited) so the textarea on top renders the real characters.
        style: 'background-color: rgba(95, 227, 140, 0.18); border-bottom: 2px solid #5FE38C; padding: 0; border-radius: 3px;',
      });
    }

    if (selectedText && selectionStart !== selectionEnd && (isPartiallyRegenerating || regenerationComplete)) {
      ranges.push({
        start: selectionStart,
        end: selectionEnd,
        style: isPartiallyRegenerating
          ? 'background-color: #3b82f6; color: #3b82f6; padding: 0; border-radius: 3px; animation: pulse 1.5s infinite;'
          : 'background-color: #10b981; color: #10b981; padding: 0; border-radius: 3px;',
      });
    }

    if (ranges.length === 0) return escapeHtml(text);

    // Sort and drop overlapping ranges (first-by-start-position wins).
    ranges.sort((a, b) => a.start - b.start);
    const merged: Range[] = [];
    for (const r of ranges) {
      if (merged.length === 0 || r.start >= merged[merged.length - 1].end) {
        merged.push(r);
      }
    }

    let html = '';
    let cursor = 0;
    for (const r of merged) {
      if (r.start > cursor) html += escapeHtml(text.substring(cursor, r.start));
      html += `<span style="${r.style}">${escapeHtml(text.substring(r.start, r.end))}</span>`;
      cursor = r.end;
    }
    if (cursor < text.length) html += escapeHtml(text.substring(cursor));
    return html;
  };

  const handleTextSelection = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end && !generatedScript) { // Only allow selection when not showing generated script
      const selectedPortion = textarea.value.substring(start, end);
      setSelectedText(selectedPortion);
      setSelectionStart(start);
      setSelectionEnd(end);
      setShowRegenerateButton(true);
    } else {
      setSelectedText('');
      setSelectionStart(0);
      setSelectionEnd(0);
      setShowRegenerateButton(false);
    }
  };

  const handleManualScriptSave = async () => {
    if (!selectedProject || !editableScript.trim()) return;
    
    setSavingScript(true);
    
    try {
      const response = await fetch('/api/save-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProject.id,
          script: editableScript
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Update the selected project with the new script
        setSelectedProject(prev => prev ? { ...prev, script: editableScript } : null);
        setHasUnsavedChanges(false);
        setGeneratedScript(''); // Clear to show the updated project script
      } else {
        console.error('❌ Error saving manual script:', data.error);
        alert('Failed to save script: ' + data.error);
      }
    } catch (error) {
      console.error('❌ Manual script save error:', error);
      alert('Failed to save script: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
    
    setSavingScript(false);
  };

  const handleScriptChange = (newScript: string) => {
    setEditableScript(newScript);
    // Check if there are unsaved changes
    const currentScript = selectedProject?.script || '';
    setHasUnsavedChanges(newScript !== currentScript);
  };

  const handleAcceptSuggestion = (suggestionIndex: number) => {
    if (!activeOverlays[suggestionIndex] || !selectedProject?.script) return;
    
    const suggestion = activeOverlays[suggestionIndex];

    // Use the actual matched text from fuzzy matching
    const textToReplace = suggestion.actualMatchedText || suggestion.original_text;

    // Locate which occurrence of textToReplace this overlay refers to, using the
    // same left-to-right walk the renderer uses. A blind .replace() would always
    // hit the FIRST occurrence and corrupt the script when a sentence repeats.
    const sortedOverlays = activeOverlays
      .map((o, i) => ({ o, i }))
      .sort((a, b) => {
        const ai = scriptWithOverlays.indexOf(a.o.actualMatchedText || a.o.original_text);
        const bi = scriptWithOverlays.indexOf(b.o.actualMatchedText || b.o.original_text);
        return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
      });

    let cursor = 0;
    let matchStart = -1;
    for (const { o, i } of sortedOverlays) {
      const t = o.actualMatchedText || o.original_text;
      const idx = scriptWithOverlays.indexOf(t, cursor);
      if (idx === -1) continue;
      if (i === suggestionIndex) { matchStart = idx; break; }
      cursor = idx + t.length;
    }

    // Fallback to first match if the positional walk couldn't place it
    if (matchStart === -1) matchStart = scriptWithOverlays.indexOf(textToReplace);
    if (matchStart === -1) {
      console.warn('Could not locate suggestion text in script; skipping');
      return;
    }


    const updatedScript =
      scriptWithOverlays.substring(0, matchStart) +
      suggestion.suggested_replacement +
      scriptWithOverlays.substring(matchStart + textToReplace.length);
    setScriptWithOverlays(updatedScript);

    // Mark this overlay as 'accepted' (instead of removing it). It stays
    // visible in green so we don't lose track of which sections changed and
    // still need to be re-recorded. The matcher needs to point at the NEW
    // text now since the OLD text isn't in the script anymore.
    const updatedOverlays = activeOverlays.map((o, idx) =>
      idx === suggestionIndex
        ? { ...o, status: 'accepted', actualMatchedText: suggestion.suggested_replacement }
        : o
    );
    setActiveOverlays(updatedOverlays);

    // Update the project script in the database and main editor immediately
    updateProjectScript(updatedScript);

    // If this overlay came from the persisted cron flow (has a DB id), also
    // flip its row to 'accepted' so it persists across page loads.
    if (suggestion.id) {
      fetch('/api/pending-edits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editId: suggestion.id, action: 'accept' }),
      }).catch(e => console.error('Failed to mark accepted:', e));
    }

  };

  // Called when the user has re-recorded the affected video section.
  // Removes the green overlay and clears the row from the DB.
  const handleMarkRecorded = (suggestionIndex: number) => {
    const suggestion = activeOverlays[suggestionIndex];
    const updatedOverlays = activeOverlays.filter((_, idx) => idx !== suggestionIndex);
    setActiveOverlays(updatedOverlays);

    if (suggestion?.id) {
      fetch('/api/pending-edits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editId: suggestion.id, action: 'mark_recorded' }),
      }).catch(e => console.error('Failed to mark recorded:', e));
    }

  };

  // Same as above but for the project-detail view's standalone panel —
  // operates on `acceptedOverlays` (filtered, project-detail-only) rather
  // than the script-maintenance `activeOverlays` list.
  const handleMarkRecordedInDetail = (overlayId: string) => {
    setAcceptedOverlays(prev => prev.filter(o => o.id !== overlayId));
    fetch('/api/pending-edits', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ editId: overlayId, action: 'mark_recorded' }),
    }).catch(e => console.error('Failed to mark recorded:', e));
    // Keep the project-card / Check Updates badge count in sync.
    setSelectedProject(prev => prev
      ? { ...prev, pendingEditsCount: Math.max(0, (prev.pendingEditsCount || 0) - 1) }
      : null
    );
  };

  const handleDeclineSuggestion = (suggestionIndex: number) => {
    const suggestion = activeOverlays[suggestionIndex];
    // Just remove the overlay without changing the script
    const updatedOverlays = activeOverlays.filter((_, index) => index !== suggestionIndex);
    setActiveOverlays(updatedOverlays);

    // If this overlay came from the persisted cron flow, mark it declined in
    // the DB so it doesn't reappear.
    if (suggestion?.id) {
      fetch('/api/pending-edits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editId: suggestion.id, action: 'decline' }),
      }).catch(e => console.error('Failed to mark declined:', e));
    }

  };

  const updateProjectScript = async (newScript: string) => {
    if (!selectedProject) return;
    
    try {
      const response = await fetch('/api/save-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProject.id,
          script: newScript
        })
      });

      if (response.ok) {
        // Update the local project state
        setSelectedProject(prev => prev ? { ...prev, script: newScript } : null);
        // Update the editable script state so main editor shows changes
        setEditableScript(newScript);
        // Clear unsaved changes flag since we just saved
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('❌ Failed to update script:', error);
    }
  };

  // Helper function to normalize text for better matching
  const normalizeText = (text: string) => {
    return text
      // Normalize all quote types to standard double quotes
      .replace(/[""''`]/g, '"')
      .replace(/\\"/g, '"')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim()
      // Remove common formatting differences
      .replace(/\u00A0/g, ' ') // Non-breaking spaces
      .toLowerCase();
  };

  const initializeScriptWithOverlays = (rawOverlays: any[]) => {
    if (!selectedProject?.script || !rawOverlays || rawOverlays.length === 0) return;

    const preprocessedOverlays = rawOverlays.map((section: any, index: number) => {
      const script = selectedProject.script!; // We already checked it exists above
      // For accepted overlays the script already contains the suggested
      // replacement; match against THAT so the green highlight still finds it.
      const targetText: string = section.status === 'accepted' ? section.suggested_replacement : section.original_text;
      let textIndex = script.indexOf(targetText);
      let actualMatchedText = targetText;
      
      if (textIndex === -1) {
        
        // First try: Direct normalized comparison
        const normalizedAiText = normalizeText(targetText);
        const sentences = script.split(/[.!?]/);
        
        // Look for normalized exact matches first
        let bestMatch = '';
        let bestScore = 0;
        let matchType = '';
        
        sentences.forEach(sentence => {
          const fullSentence = sentence.trim();
          if (fullSentence.length < 10) return; // Skip very short sentences
          
          const normalizedSentence = normalizeText(fullSentence);
          
          // Check for normalized exact match (90%+ similarity after normalization)
          if (normalizedSentence === normalizedAiText) {
            bestMatch = fullSentence;
            bestScore = 1.0;
            matchType = 'normalized-exact';
            return;
          }
          
          // Check for high similarity (contains most of the normalized text)
          if (normalizedSentence.includes(normalizedAiText) || normalizedAiText.includes(normalizedSentence)) {
            const similarity = normalizedAiText.length > normalizedSentence.length 
              ? normalizedSentence.length / normalizedAiText.length
              : normalizedAiText.length / normalizedSentence.length;
            
            if (similarity > 0.8 && similarity > bestScore) {
              bestMatch = fullSentence;
              bestScore = similarity;
              matchType = 'high-similarity';
            }
          }
        });
        
        // If normalized matching failed, fall back to keyword matching
        if (!bestMatch) {
          const keywords = targetText.split(' ').filter((word: string) => 
            word.length > 3 && !['the', 'and', 'for', 'that', 'this', 'with', 'from', 'they', 'will', 'have', 'been'].includes(word.toLowerCase())
          );
          
          if (keywords.length > 0) {
            sentences.forEach(sentence => {
              const matchingKeywords = keywords.filter((keyword: string) => 
                normalizeText(sentence).includes(normalizeText(keyword))
              );
              const score = matchingKeywords.length / keywords.length;
              
              if (score > 0.4 && score > bestScore && sentence.trim().length > 20) {
                bestScore = score;
                bestMatch = sentence.trim();
                matchType = 'keyword';
              }
            });
          }
        }
        
        if (bestMatch) {
          actualMatchedText = bestMatch;
        }
      }
      
      return {
        ...section,
        actualMatchedText: actualMatchedText // Store the actual text we'll replace
      };
    });
    
    setScriptWithOverlays(selectedProject.script);
    setActiveOverlays(preprocessedOverlays);
  };

  // Component to render script with interactive overlays
  const ScriptWithOverlays = ({ script, overlays, onAccept, onDecline, onMarkRecorded }: {
    script: string;
    overlays: any[];
    onAccept: (index: number) => void;
    onDecline: (index: number) => void;
    onMarkRecorded: (index: number) => void;
  }) => {
    const [selectedOverlay, setSelectedOverlay] = useState<number | null>(null);

    const renderScriptWithHighlights = () => {
      if (!overlays.length) {
        return <div className="whitespace-pre-wrap font-sans leading-relaxed">{script}</div>;
      }

      // Create an array of script parts with highlights
      const scriptParts: JSX.Element[] = [];
      let lastIndex = 0;
      let partKey = 0;

      // Sort overlays by their position in the script
      const sortedOverlays = [...overlays]
        .map((overlay, index) => ({ ...overlay, originalIndex: index }))
        .sort((a, b) => {
          const aIndex = script.indexOf(a.original_text);
          const bIndex = script.indexOf(b.original_text);
          // If exact match fails, put at end for now (fuzzy matching will handle positioning)
          return (aIndex === -1 ? Infinity : aIndex) - (bIndex === -1 ? Infinity : bIndex);
        });

      sortedOverlays.forEach((overlay) => {
        // Use the preprocessed actualMatchedText if available, otherwise fallback to original_text
        const actualText = overlay.actualMatchedText || overlay.original_text;
        const textIndex = script.indexOf(actualText, lastIndex);
        
        if (textIndex !== -1) {
          // Add text before the highlight
          if (textIndex > lastIndex) {
            scriptParts.push(
              <span key={partKey++}>
                {script.substring(lastIndex, textIndex)}
              </span>
            );
          }

          // Add the highlighted text
          scriptParts.push(
            <span
              key={partKey++}
              className={`cursor-pointer transition-colors relative inline ${
                overlay.status === 'accepted' ? 'bg-green-200 border-b-2 border-green-400 hover:bg-green-300' :
                overlay.severity === 'critical' ? 'bg-red-200 border-b-2 border-red-400 hover:bg-red-300' :
                overlay.severity === 'moderate' ? 'bg-yellow-200 border-b-2 border-yellow-400 hover:bg-yellow-300' :
                'bg-blue-200 border-b-2 border-blue-400 hover:bg-blue-300'
              }`}
              onClick={() => setSelectedOverlay(overlay.originalIndex)}
              title={overlay.status === 'accepted' ? `Click to mark as recorded — ${overlay.reason}` : `Click to review — ${overlay.reason}`}
            >
              {actualText}
            </span>
          );

          lastIndex = textIndex + actualText.length;
        }
      });

      // Add remaining text
      if (lastIndex < script.length) {
        scriptParts.push(
          <span key={partKey++}>
            {script.substring(lastIndex)}
          </span>
        );
      }

      return (
        <div className="relative">
          <div className="whitespace-pre-wrap font-sans leading-relaxed">
            {scriptParts}
          </div>
          
          {/* Overlay Popup */}
          {selectedOverlay !== null && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-raised rounded-xl border border-gray-200 shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {overlays[selectedOverlay].status === 'accepted' ? 'Accepted Update' : 'Update Suggestion'}
                    <span className={`ml-2 text-xs font-medium px-2 py-1 rounded ${
                      overlays[selectedOverlay].status === 'accepted' ? 'bg-green-200 text-green-800' :
                      overlays[selectedOverlay].severity === 'critical' ? 'bg-red-200 text-red-800' :
                      overlays[selectedOverlay].severity === 'moderate' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {overlays[selectedOverlay].status === 'accepted' ? 'AWAITING RECORDING' : overlays[selectedOverlay].severity.toUpperCase()}
                    </span>
                  </h3>
                  <button 
                    onClick={() => setSelectedOverlay(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  {overlays[selectedOverlay].status === 'accepted' ? (
                    <>
                      <div>
                        <h4 className="font-medium text-gray-800 text-sm mb-2">Now in script:</h4>
                        <div className="bg-green-50 p-3 rounded text-sm text-gray-700 border-l-4 border-green-400">
                          {overlays[selectedOverlay].suggested_replacement}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-800 text-sm mb-2">Reason for change:</h4>
                        <p className="text-sm text-gray-600">{overlays[selectedOverlay].reason}</p>
                      </div>

                      <div className="text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 p-3 rounded">
                        📹 Once you&apos;ve re-recorded this section, mark it as recorded to clear the green highlight.
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => {
                            onMarkRecorded(selectedOverlay);
                            setSelectedOverlay(null);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          <Video className="w-4 h-4" />
                          Mark as Recorded
                        </button>
                        <button
                          onClick={() => setSelectedOverlay(null)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                          Close
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <h4 className="font-medium text-gray-800 text-sm mb-2">Current (Outdated):</h4>
                        <div className="bg-red-50 p-3 rounded text-sm text-gray-700 border-l-4 border-red-400">
                          {overlays[selectedOverlay].original_text}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-800 text-sm mb-2">Why it&apos;s outdated:</h4>
                        <p className="text-sm text-gray-600">{overlays[selectedOverlay].reason}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-800 text-sm mb-2">Suggested Update:</h4>
                        <div className="bg-green-50 p-3 rounded text-sm text-gray-700 border-l-4 border-green-400">
                          {overlays[selectedOverlay].suggested_replacement}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => {
                            onAccept(selectedOverlay);
                            setSelectedOverlay(null);
                          }}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          ✓ Accept Change
                        </button>
                        <button
                          onClick={() => {
                            onDecline(selectedOverlay);
                            setSelectedOverlay(null);
                          }}
                          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                        >
                          ✗ Decline
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    return renderScriptWithHighlights();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ground">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthForm onSuccess={() => window.location.reload()} />;
  }

  return (
    <div className="h-screen bg-ground flex flex-col">
      {/* Header */}
      <header className="bg-raised border-b border-line flex-shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              {currentView === 'projects' && (
                <button
                  onClick={handleBackToClients}
                  className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />Back
                </button>
              )}
              {currentView === 'project-detail' && (
                <button
                  onClick={handleBackToProjects}
                  className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />Back
                </button>
              )}
              {currentView === 'script-maintenance' && (
                <button
                  onClick={handleBackToProjectDetail}
                  className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />Back to Project
                </button>
              )}
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {currentView === 'clients' && 'Script Manager'}
                {currentView === 'projects' && selectedClient?.name}
                {currentView === 'project-detail' && selectedProject?.title}
                {currentView === 'script-maintenance' && `${selectedProject?.title} - Script Maintenance`}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentView === 'clients' && (
                <button 
                  onClick={() => setShowClientModal(true)}
                  className="bg-primary-600 text-ink px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Client
                </button>
              )}
              {currentView === 'projects' && (
                <>
                  {selectedClient && (
                    <button
                      onClick={openRepoWatchModal}
                      className="bg-primary-600 text-ink px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium flex items-center text-sm"
                      title="Automatic script updates from a GitHub repo's feature docs"
                    >
                      <GitBranch className="w-4 h-4 mr-2" />Repo updates
                    </button>
                  )}
                  <button
                    onClick={() => setShowProjectModal(true)}
                    className="bg-primary-600 text-ink px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </button>
                </>
              )}
              {currentView === 'project-detail' && selectedProject?.script && (
                <button
                  onClick={handleOpenScriptMaintenance}
                  className="bg-primary-600 text-ink px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium flex items-center"
                >
                  <Search className="w-4 h-4 mr-2" />Check Updates
                  {selectedProject?.pendingEditsCount && selectedProject.pendingEditsCount > 0 ? (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-orange-500 rounded-full">
                      {selectedProject.pendingEditsCount}
                    </span>
                  ) : null}
                </button>
              )}
              
              <button 
                onClick={handleLogout}
                className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
        {currentView === 'clients' ? (
          // Clients View
          <div className="h-full flex flex-col">
            {clients.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">No clients yet</h2>
                  <p className="text-gray-600 mb-6">Get started by adding your first client</p>
                  <button 
                    onClick={() => setShowClientModal(true)}
                    className="bg-primary-600 text-ink px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium"
                  >
                    Add Your First Client
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
                {clients.map((client) => (
                  <div key={client.id} className="bg-raised border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group relative">
                                        <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClient(client.id);
                      }}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div 
                      onClick={() => handleClientClick(client)}
                      className="w-full h-full"
                    >
                      <div className="flex items-start mb-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary-600" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{client.name}</h3>
                      <p className="text-gray-600 mb-4">{client.company}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{getClientProjects(client.id).length} project{getClientProjects(client.id).length !== 1 ? 's' : ''}</span>
                        <span>Added {new Date(client.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}
          </div>
        ) : currentView === 'projects' ? (
          // Client View (Projects)
          <div className="h-full flex flex-col">
            <div className="h-full flex flex-col">
            {selectedClient && getClientProjects(selectedClient.id).length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-primary-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">No projects yet for {selectedClient?.name}</h2>
                  <p className="text-gray-600 mb-6">Create your first project to get started</p>
                  <button 
                    onClick={() => setShowProjectModal(true)}
                    className="bg-primary-600 text-ink px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium"
                  >
                    Create Your First Project
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
                {selectedClient && getClientProjects(selectedClient.id).map((project) => (
                  <div 
                    key={project.id} 
                    className="bg-raised border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group relative"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div 
                      onClick={() => handleProjectClick(project)}
                      className="w-full h-full"
                    >
                      <div className="flex items-start mb-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary-600" />
                        </div>
                        <div className="ml-3 flex-1">
                          <span className="text-xs text-primary-600 font-medium">
                            📚 Tutorial
                          </span>
                          {project.pendingEditsCount && project.pendingEditsCount > 0 ? (
                            <span className="ml-2 text-xs bg-orange-100 text-orange-800 font-medium px-2 py-0.5 rounded">
                              ⚠️ {project.pendingEditsCount} pending
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.title}</h3>
                      <p className="text-gray-600 mb-4">{project.description}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'generating' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                        <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}
              </div>
          </div>
        ) : currentView === 'script-maintenance' ? (
          // Script Maintenance View — review suggested edits queued by the daily repo check
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-8 px-2">
              {activeOverlays.length > 0 && selectedProject?.script ? (
                <div className="bg-raised rounded-xl border border-gray-200 shadow-lg p-8">
                  <div className="p-4 rounded-lg mb-6 bg-yellow-50 border border-yellow-200">
                    <div className="font-medium text-yellow-800">
                      ⚠️ {activeOverlays.length} suggested update{activeOverlays.length === 1 ? '' : 's'} from the daily repo check
                    </div>
                    <p className="text-sm mt-1 text-yellow-700">
                      Click on a highlighted section to review and accept or decline the suggestion.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Script with Update Suggestions</h3>
                    <div className="bg-gray-50 text-gray-900 p-6 rounded-lg border border-gray-200 relative">
                      <ScriptWithOverlays
                        script={scriptWithOverlays || selectedProject.script}
                        overlays={activeOverlays}
                        onAccept={handleAcceptSuggestion}
                        onDecline={handleDeclineSuggestion}
                        onMarkRecorded={handleMarkRecorded}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-raised rounded-xl border border-gray-200 shadow-lg p-8 text-center">
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Search className="w-7 h-7 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">No suggested updates right now</h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    The daily repo check watches your connected GitHub repo for feature changes and queues suggested edits here automatically. When something changes, it&apos;ll show up on this screen (and in a digest email) for you to accept or decline.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Project Detail View
          <div className="h-full flex flex-col">
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-8 min-h-0">

                             {/* Script editor (full width) */}
               <div className="lg:col-span-5 flex flex-col min-h-0">
                 {acceptedOverlays.length > 0 && (
                   <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded p-3 flex-shrink-0">
                     <div className="text-sm font-medium text-yellow-900 mb-1">
                       📹 {acceptedOverlays.length} section{acceptedOverlays.length === 1 ? '' : 's'} awaiting re-recording
                     </div>
                     <p className="text-xs text-yellow-700 mb-3">
                       Green-highlighted text below was changed by accepted edits. Click &quot;Mark as Recorded&quot; once you&apos;ve filmed each section.
                     </p>
                     <div className="space-y-2 max-h-40 overflow-y-auto">
                       {acceptedOverlays.map((o) => (
                         <div key={o.id} className="bg-raised border border-yellow-200 rounded p-2">
                           <div className="text-xs text-gray-700 mb-2 line-clamp-2">
                             &ldquo;{(o.suggested_replacement || '').slice(0, 200)}{(o.suggested_replacement || '').length > 200 ? '…' : ''}&rdquo;
                           </div>
                           <button
                             onClick={() => handleMarkRecordedInDetail(o.id)}
                             className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                           >
                             <Video className="w-3 h-3" />
                             Mark as Recorded
                           </button>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 <div className="flex items-center justify-between mb-2 flex-shrink-0">
                   <label className="block text-sm font-medium text-gray-700">
                     {selectedProject?.script ? 'Script Editor' : 'Generated Script'}
                   </label>
                   {hasUnsavedChanges && (
                     <div className="flex items-center space-x-2">
                       <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                         Unsaved changes
                       </span>
                       <button
                         onClick={handleManualScriptSave}
                         disabled={savingScript}
                         className="px-3 py-1 bg-primary-600 text-ink text-xs rounded hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                       >
                         {savingScript ? (
                           <>
                             <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                             Saving...
                           </>
                         ) : (
                           'Save'
                         )}
                       </button>
                     </div>
                   )}
                 </div>
                 
                                 {generatedScript || selectedProject?.script || editableScript ? (
                  <div className="flex-1 flex flex-col">
                    <div className="relative flex-1 min-h-0">
                      {/* Background overlay for highlighting */}
                      <div
                        ref={overlayRef}
                        className="absolute inset-0 p-6 rounded-lg border border-transparent text-transparent pointer-events-none font-sans leading-relaxed text-sm whitespace-pre-wrap overflow-y-auto z-0"
                        style={{
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word'
                        }}
                        dangerouslySetInnerHTML={{
                          __html: renderTextWithHighlight(generatedScript || editableScript || '')
                        }}
                      />
                      
                      {/* Add pulse animation styles */}
                      <style jsx>{`
                        @keyframes pulse {
                          0%, 100% { opacity: 1; }
                          50% { opacity: 0.7; }
                        }
                      `}</style>
                      
                      {/* Main textarea */}
                      <textarea
                        ref={textareaRef}
                        value={generatedScript || editableScript}
                        onChange={(e) => {
                          if (!generatedScript) {
                            // Only allow editing if not showing a freshly generated script
                            handleScriptChange(e.target.value);
                          }
                        }}
                        onScroll={(e) => {
                          // Sync overlay scroll with textarea scroll
                          if (overlayRef.current) {
                            overlayRef.current.scrollTop = e.currentTarget.scrollTop;
                            overlayRef.current.scrollLeft = e.currentTarget.scrollLeft;
                          }
                        }}
                        onSelect={handleTextSelection}
                        onMouseUp={handleTextSelection}
                        onKeyUp={handleTextSelection}
                        className={`${
                          generatedScript 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'bg-transparent border-gray-200 hover:border-gray-300'
                        } text-gray-900 p-6 rounded-lg border absolute inset-0 w-full h-full resize-none font-sans leading-relaxed text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 z-10`}
                        style={{ background: generatedScript ? undefined : 'rgba(11, 13, 18, 0.72)' }}
                        placeholder={
                          generatedScript 
                            ? "✨ Fresh AI result - will become editable in a moment..." 
                            : isPartiallyRegenerating
                              ? "🔄 Regenerating selected text..."
                              : (selectedProject?.script ? "Edit your script here..." : "Generated script will appear here...")
                        }
                        readOnly={!!generatedScript || isPartiallyRegenerating}
                      />
                    </div>
                    
                    {/* Partial Regeneration Controls */}
                    {(showRegenerateButton || isPartiallyRegenerating || regenerationComplete) && selectedText && !generatedScript && (
                      <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="text-sm font-medium mb-1">
                              {isPartiallyRegenerating ? (
                                <span className="text-blue-900">🔄 Regenerating Text:</span>
                              ) : regenerationComplete ? (
                                <span className="text-green-900">✅ Regeneration Complete!</span>
                              ) : (
                                <span className="text-blue-900">📝 Selected: {selectedText.length} characters</span>
                              )}
                            </div>
                            <div className={`text-xs p-3 rounded max-h-20 overflow-y-auto transition-all duration-300 ${
                              isPartiallyRegenerating 
                                ? 'bg-blue-500 text-white animate-pulse border-2 border-blue-300' 
                                : regenerationComplete
                                  ? 'bg-green-500 text-white border-2 border-green-300'
                                  : 'text-blue-700 bg-blue-100'
                            }`}>
                              "{selectedText.length > 100 ? selectedText.substring(0, 100) + '...' : selectedText}"
                            </div>
                            {isPartiallyRegenerating && (
                              <div className="text-xs text-blue-600 mt-1 flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                                This text is being regenerated...
                              </div>
                            )}
                            {regenerationComplete && (
                              <div className="text-xs text-green-600 mt-1 flex items-center">
                                <div className="text-green-500 mr-2">✓</div>
                                This text has been successfully regenerated!
                              </div>
                            )}
                          </div>
                          {!isPartiallyRegenerating && (
                            <button
                              onClick={() => {
                                setShowRegenerateButton(false);
                                setSelectedText('');
                                setSelectionStart(0);
                                setSelectionEnd(0);
                                setRegenerationComplete(false);
                              }}
                              className="ml-3 text-blue-400 hover:text-blue-600 text-sm"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        
                        {!isPartiallyRegenerating && !regenerationComplete && (
                          <>
                            <textarea
                              value={modificationRequest}
                              onChange={(e) => setModificationRequest(e.target.value)}
                              className="w-full px-3 py-2 border border-blue-300 rounded text-sm resize-none"
                              rows={3}
                              placeholder="Describe how you'd like this selected text to be changed..."
                            />
                            
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={handlePartialRegenerate}
                                disabled={!modificationRequest.trim()}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />Regenerate Selection
                              </button>
                              <button
                                onClick={() => {
                                  setShowRegenerateButton(false);
                                  setSelectedText('');
                                  setSelectionStart(0);
                                  setSelectionEnd(0);
                                  setRegenerationComplete(false);
                                }}
                                className="px-4 py-2 border border-blue-300 text-blue-600 rounded text-sm hover:bg-blue-50 transition-colors duration-200"
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        )}
                        
                        {isPartiallyRegenerating && (
                          <div className="text-center py-4">
                            <div className="inline-flex items-center text-blue-600 text-sm font-medium">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                              AI is regenerating your selected text...
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                   <div className="bg-gray-50 text-gray-500 p-6 rounded-lg border border-gray-200 overflow-y-auto flex-1 font-sans">
                     No script yet.
                     <br /><br />
                     The script is written and edited directly here (e.g. with Claude). It will appear once added, and the daily repo check will keep it up to date.
                   </div>
                 )}
                 
                 {hasUnsavedChanges && (
                   <div className="mt-3 flex-shrink-0">
                     <button
                       onClick={handleManualScriptSave}
                       disabled={savingScript}
                       className="w-full px-4 py-3 bg-primary-600 text-ink rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                     >
                       {savingScript ? (
                         <>
                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                           Saving Script...
                         </>
                       ) : (
                         'Save Script Changes'
                       )}
                     </button>
                   </div>
                 )}
               </div>
              </div>
            </div>
        )}
      </main>

      {/* Client Creation Modal */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-raised rounded-xl border border-gray-200 shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add New Client</h2>
              <button 
                onClick={() => setShowClientModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateClient} className="p-6">
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={clientForm.name}
                  onChange={(e) => setClientForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="Acme Corp"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Description *
                </label>
                <textarea
                  id="description"
                  value={clientForm.description}
                  onChange={(e) => setClientForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field resize-none"
                  placeholder="Describe this company..."
                  rows={2}
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-ink rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Repo-updates config modal */}
      {showRepoWatchModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-raised rounded-xl border border-gray-200 shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Repo updates</h2>
              <button
                onClick={() => { if (savingRepoWatch) return; setShowRepoWatchModal(false); setRepoWatchMessage(null); }}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Each day the system checks this GitHub repo&apos;s feature docs for changes and, when a feature changes, audits the affected video scripts — no video-to-doc mapping needed. Read-only: it only ever reads the repo.
              </p>

              {!repoWatchLoaded ? (
                <div className="flex items-center text-sm text-gray-500 py-6">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mr-2"></div>
                  Loading…
                </div>
              ) : (
                <>
                  {!repoWatchTokenConfigured && (
                    <div className="mb-4 text-xs p-3 rounded bg-amber-50 border border-amber-200 text-amber-800">
                      Heads up: <code>GITHUB_RELEASE_TOKEN</code> isn&apos;t set on the server yet. You can save this config now, but checks won&apos;t run until the token is added to the deployment&apos;s environment variables.
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                      <input type="text" value={rwOwner} onChange={(e) => setRwOwner(e.target.value)} placeholder="bimobject" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" disabled={savingRepoWatch} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Repo</label>
                      <input type="text" value={rwName} onChange={(e) => setRwName(e.target.value)} placeholder="bim-dictionary" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" disabled={savingRepoWatch} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                      <input type="text" value={rwBranch} onChange={(e) => setRwBranch(e.target.value)} placeholder="main" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" disabled={savingRepoWatch} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Docs folder</label>
                      <input type="text" value={rwDocsPath} onChange={(e) => setRwDocsPath(e.target.value)} placeholder="docs/features" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" disabled={savingRepoWatch} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Status: {repoWatchActive ? <span className="text-teal-600 font-medium">active</span> : <span className="text-gray-500">off</span>}
                  </p>

                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Recent checks</p>
                    {repoRuns.length === 0 ? (
                      <p className="text-xs text-gray-400">
                        No checks logged yet. Each daily run (06:00 UTC) is recorded here — even on days where nothing changed — so you can confirm it ran.
                      </p>
                    ) : (
                      <div className="max-h-44 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                        {repoRuns.map((r) => (
                          <div key={r.id} className="px-3 py-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">{new Date(r.started_at).toLocaleString()}</span>
                              <span className={r.status === 'error' ? 'text-red-600 font-medium' : r.status === 'partial' ? 'text-amber-600 font-medium' : 'text-teal-600 font-medium'}>{r.status}</span>
                            </div>
                            <div className="text-gray-700 mt-0.5">{r.summary || '—'}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {repoWatchMessage && (
                    <div className="mt-4 text-sm p-3 rounded bg-gray-50 border border-gray-200">{repoWatchMessage}</div>
                  )}

                  <div className="flex justify-between items-center gap-3 mt-6">
                    {repoWatchActive ? (
                      <button type="button" onClick={() => handleSaveRepoWatch(false)} disabled={savingRepoWatch} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50">
                        Pause
                      </button>
                    ) : (<span />)}
                    <div className="flex gap-3">
                      <button type="button" onClick={() => { if (savingRepoWatch) return; setShowRepoWatchModal(false); setRepoWatchMessage(null); }} disabled={savingRepoWatch} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50">
                        Cancel
                      </button>
                      <button type="button" onClick={() => handleSaveRepoWatch(true)} disabled={savingRepoWatch || !rwOwner.trim() || !rwName.trim()} className="px-4 py-2 bg-primary-600 text-ink rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 flex items-center">
                        {savingRepoWatch && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                        {repoWatchActive ? 'Save' : 'Turn on'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Project Creation Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-raised rounded-xl border border-gray-200 shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add New Project</h2>
              <button 
                onClick={() => setShowProjectModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-6">
              <div className="mb-4">
                <label htmlFor="projectTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  id="projectTitle"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                  className="input-field"
                  placeholder="My Video Script"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="projectDescription"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field resize-none"
                  placeholder="Describe what this script is for..."
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-ink rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 
