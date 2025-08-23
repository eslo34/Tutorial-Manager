'use client';

import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { LearningSession, LearningChatMessage } from '@/lib/types';

interface LearningChatProps {
  projectId: string; // Now represents clientId but keeping same name for compatibility
  softwareName: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: string;
}

export default function LearningChat({ projectId, softwareName }: LearningChatProps) {
  const [session, setSession] = useState<LearningSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize learning session
  useEffect(() => {
    initializeLearningSession();
  }, [projectId]);

  const initializeLearningSession = async () => {
    try {
      setLoading(true);
      
      // Create or get existing learning session
      const sessionResponse = await fetch('/api/learning/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: projectId, softwareName }) // projectId is actually clientId
      });

      if (!sessionResponse.ok) throw new Error('Failed to create learning session');
      
      const { session: newSession } = await sessionResponse.json();
      setSession(newSession);

      // Load existing chat messages
      await loadChatMessages(newSession.id);

    } catch (error) {
      console.error('Error initializing learning session:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChatMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/learning/chat?sessionId=${sessionId}`);
      if (!response.ok) throw new Error('Failed to load messages');
      
      const { messages: chatMessages } = await response.json();
      setMessages(chatMessages.map((msg: LearningChatMessage) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.createdAt),
        type: msg.messageType
      })));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };



  const sendMessage = async () => {
    if (!session?.id || !inputMessage.trim() || sending) return;

    const userMessage = {
      id: 'temp-' + Date.now(),
      role: 'user' as const,
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSending(true);

    try {
      const response = await fetch('/api/learning/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          message: inputMessage.trim()
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const { assistantMessage } = await response.json();
      
      setMessages(prev => [
        ...prev.filter(msg => msg.id !== userMessage.id),
        {
          id: userMessage.id,
          role: 'user',
          content: userMessage.content,
          timestamp: userMessage.timestamp
        },
        {
          id: assistantMessage.id,
          role: 'assistant',
          content: assistantMessage.content,
          timestamp: new Date(assistantMessage.created_at)
        }
      ]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the temporary user message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setSending(false);
    }
  };



  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your learning session...</p>
        </div>
      </div>
    );
  }

  if (!session && !loading) {
    return (
      <div className="card">
        <p className="text-red-600">Failed to initialize learning session. Please try again.</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] flex flex-col max-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 p-3 flex-shrink-0">
        <h3 className="text-base font-semibold text-gray-900">Learn {softwareName}</h3>
      </div>

      {/* Content Area - Chat */}
      <div className="flex-1 overflow-hidden min-h-0">
        <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-primary-200' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-pulse w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div className="animate-pulse w-2 h-2 bg-gray-400 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                      <div className="animate-pulse w-2 h-2 bg-gray-400 rounded-full" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4 flex-shrink-0 bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask questions about the software or request guidance..."
                  className="flex-1 input-field"
                  disabled={sending}
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !inputMessage.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
