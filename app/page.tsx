'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Client, Project } from '@/lib/types';

import { crawlDocumentation, CrawlResponse, getContentSummary, formatContentForAI, aggregateContent } from '@/lib/crawler';
import { getPromptTemplate } from '@/lib/prompt-templates';
import { generateScript } from '@/lib/openai';
import { VideoType } from '@/lib/types';
import { Plus, Users, X, LogOut, FileText, ArrowLeft, Search, Trash2, BookOpen, PenTool } from 'lucide-react';
import AuthForm from '@/components/AuthForm';
import LearningChat from '@/components/LearningChat';

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

  const [clientMode, setClientMode] = useState<'projects' | 'learning'>('projects');
  const [clientForm, setClientForm] = useState({
    name: '',
    description: '',
    documentationUrl: '',
    specificUrls: ''
  });
  const [clientCrawlMode, setClientCrawlMode] = useState<'crawl' | 'specific'>('crawl');
  const [clientCrawling, setClientCrawling] = useState(false);
  const [clientCrawlResults, setClientCrawlResults] = useState<CrawlResponse | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    videoType: 'tutorial' as VideoType
  });
  const [documentationUrl, setDocumentationUrl] = useState('');
  const [specificUrls, setSpecificUrls] = useState('');
  const [crawlMode, setCrawlMode] = useState<'crawl' | 'specific'>('crawl');
  const [prompt, setPrompt] = useState('');
  const [userRequest, setUserRequest] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [crawling, setCrawling] = useState(false);
  const [crawlResults, setCrawlResults] = useState<CrawlResponse | null>(null);
  const [generating, setGenerating] = useState(false);
  const [modifying, setModifying] = useState(false);
  const [modificationRequest, setModificationRequest] = useState('');
  const [editableScript, setEditableScript] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savingScript, setSavingScript] = useState(false);
  
  // Script maintenance states
  const [maintenanceDocUrl, setMaintenanceDocUrl] = useState('');
  const [maintenanceSpecificUrls, setMaintenanceSpecificUrls] = useState('');
  const [maintenanceCrawlMode, setMaintenanceCrawlMode] = useState<'crawl' | 'specific'>('crawl');
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [updateResults, setUpdateResults] = useState<any>(null);
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

  // Monitoring setup modal
  const [showMonitoringModal, setShowMonitoringModal] = useState(false);
  const [monitoringRootUrl, setMonitoringRootUrl] = useState('');
  const [seedingMonitoring, setSeedingMonitoring] = useState(false);
  const [monitoringMessage, setMonitoringMessage] = useState<string | null>(null);

  // Deep-link processing guard — fires once after initial data load
  const deepLinkProcessedRef = useRef(false);

  // Debug effect to track crawling state changes
  useEffect(() => {
    console.log('🔍 Crawling state changed to:', crawling);
  }, [crawling]);

  // Debug effect to track generating state changes
  useEffect(() => {
    console.log('🔍 Generating state changed to:', generating);
  }, [generating]);

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

  const handleClientCrawlDocumentation = async () => {
    if (clientCrawlMode === 'crawl' && !clientForm.documentationUrl.trim()) return;
    if (clientCrawlMode === 'specific' && !clientForm.specificUrls.trim()) return;
    
    setClientCrawling(true);
    setClientCrawlResults(null);
    
    try {
      let results: CrawlResponse;
      
      if (clientCrawlMode === 'crawl') {
        results = await crawlDocumentation(clientForm.documentationUrl, 50);
      } else {
        const urlList = clientForm.specificUrls
          .split('\n')
          .map(url => url.trim())
          .filter(url => url.length > 0 && url.startsWith('http'));
        
        const response = await fetch('/api/scrape-specific', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ urls: urlList }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        results = await response.json();
      }
      
      setClientCrawlResults(results);
    } catch (error) {
      console.error('Client crawling failed:', error);
    }
    
    setClientCrawling(false);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name.trim() || !clientForm.description.trim()) return;
    
    try {
      // Prepare client data
      const clientData: any = {
        name: clientForm.name.trim(),
        company: clientForm.description.trim(),
        email: ''
      };

      // Add scraped documentation if available
      if (clientCrawlResults?.success && clientCrawlResults.totalContent) {
        const summary = getContentSummary(clientCrawlResults);
        clientData.scrapedContent = clientCrawlResults.totalContent;
        clientData.scrapedPages = clientCrawlResults.pages.length;
        clientData.scrapedChars = summary.totalCharacters;
        clientData.scrapedWords = summary.totalWords;
        clientData.scrapedUrl = clientCrawlMode === 'crawl' ? clientForm.documentationUrl : 'Multiple specific URLs';
        clientData.scrapedAt = new Date().toISOString();
      }

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });

      if (response.ok) {
        const data = await response.json();
        setClients(prev => [...prev, data.client]);
        setClientForm({ name: '', description: '', documentationUrl: '', specificUrls: '' });
        setClientCrawlResults(null);
        setClientCrawlMode('crawl');
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
          prompt: getPromptTemplate(projectForm.videoType),
          status: 'planning',
          videoType: projectForm.videoType
        })
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(prev => [...prev, data.project]);
        setProjectForm({ title: '', description: '', videoType: 'tutorial' });
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

  const handleSetupMonitoring = async () => {
    if (!selectedClient || !monitoringRootUrl.trim()) return;
    setSeedingMonitoring(true);
    setMonitoringMessage(null);
    try {
      const response = await fetch(`/api/clients/${selectedClient.id}/setup-monitoring`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rootUrl: monitoringRootUrl.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMonitoringMessage(`❌ ${data.error || 'Failed to set up monitoring'}`);
        return;
      }
      // Optimistically update the selected client
      const updated: Client = {
        ...selectedClient,
        monitoringEnabled: true,
        monitoringRootUrl: monitoringRootUrl.trim(),
      };
      setSelectedClient(updated);
      setClients(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      setMonitoringMessage(`✅ Seeded ${data.pagesSeeded} pages. Daily monitoring is now active.`);
      setTimeout(() => {
        setShowMonitoringModal(false);
        setMonitoringMessage(null);
        setMonitoringRootUrl('');
      }, 2500);
    } catch (error) {
      console.error('Setup monitoring error:', error);
      setMonitoringMessage(`❌ ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSeedingMonitoring(false);
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
            
            // Update the selected project with latest data
            setSelectedProject(latestProject);
            
            // Populate existing data
            setPrompt(latestProject.prompt || '');
            setGeneratedScript(''); // Clear this so UI shows selectedProject.script
            setDocumentationUrl(latestProject.scrapedUrl || '');
            setEditableScript(latestProject.script || '');
            setHasUnsavedChanges(false);
            
            // If project has scraped content, create mock crawl results to show the green box
            if (latestProject.scrapedContent && latestProject.scrapedPages) {
              const scrapedPages = latestProject.scrapedPages;
              const mockCrawlResults: CrawlResponse = {
                success: true,
                totalPages: scrapedPages,
                pages: Array.from({ length: scrapedPages }, (_, i) => ({
                  url: `${latestProject.scrapedUrl || 'Unknown URL'}/page-${i + 1}`,
                  content: `Page ${i + 1} content (${Math.round((latestProject.scrapedContent?.length || 0) / scrapedPages)} chars)`,
                  title: `Page ${i + 1}`,
                  links: []
                })),
                totalContent: latestProject.scrapedContent
              };
              setCrawlResults(mockCrawlResults);
            } else {
              setCrawlResults(null);
            }
          } else {
            // Fallback to using the project data we already have
            setPrompt(selectedProject.prompt || '');
            setGeneratedScript(''); // Clear this so UI shows selectedProject.script
            setDocumentationUrl(selectedProject.scrapedUrl || '');
            setEditableScript(selectedProject.script || '');
            setHasUnsavedChanges(false);
            
            if (selectedProject.scrapedContent && selectedProject.scrapedPages) {
              const scrapedPages = selectedProject.scrapedPages;
              const mockCrawlResults: CrawlResponse = {
                success: true,
                totalPages: scrapedPages,
                pages: Array.from({ length: scrapedPages }, (_, i) => ({
                  url: `${selectedProject.scrapedUrl || 'Unknown URL'}/page-${i + 1}`,
                  content: `Page ${i + 1} content (${Math.round((selectedProject.scrapedContent?.length || 0) / scrapedPages)} chars)`,
                  title: `Page ${i + 1}`,
                  links: []
                })),
                totalContent: selectedProject.scrapedContent
              };
              setCrawlResults(mockCrawlResults);
            } else {
              setCrawlResults(null);
            }
          }
        } catch (error) {
          console.error('Error loading project data:', error);
          // Fallback to existing data
          setPrompt(selectedProject.prompt || '');
          setGeneratedScript(''); // Clear this so UI shows selectedProject.script
          setDocumentationUrl(selectedProject.scrapedUrl || '');
          setEditableScript(selectedProject.script || '');
          setHasUnsavedChanges(false);
          setCrawlResults(null);
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

  const handleBackToClients = () => {
    setCurrentView('clients');
    setSelectedClient(null);
    setClientMode('projects'); // Reset to projects mode
  };

  const handleBackToProjects = () => {
    setCurrentView('projects');
    setSelectedProject(null);

    // Clear project detail form data
    setDocumentationUrl('');
    setSpecificUrls('');
    setCrawlMode('crawl');
    setPrompt('');
    setUserRequest('');
    setGeneratedScript('');
    setCrawlResults(null);
    setEditableScript('');
    setHasUnsavedChanges(false);
    setModificationRequest('');
    // Clear maintenance data
    setMaintenanceDocUrl('');
    setMaintenanceSpecificUrls('');
    setMaintenanceCrawlMode('crawl');
    setUpdateResults(null);
    setScriptWithOverlays('');
    setActiveOverlays([]);
  };

  const handleOpenScriptMaintenance = () => {
    setCurrentView('script-maintenance');
    // Pre-populate with original crawl data if available
    if (selectedProject?.scrapedUrl && selectedProject.scrapedUrl !== 'Multiple specific URLs') {
      setMaintenanceDocUrl(selectedProject.scrapedUrl);
    }
  };

  const handleBackToProjectDetail = () => {
    setCurrentView('project-detail');
    // Clear maintenance data
    setMaintenanceDocUrl('');
    setMaintenanceSpecificUrls('');
    setMaintenanceCrawlMode('crawl');
    setUpdateResults(null);
    setScriptWithOverlays('');
    setActiveOverlays([]);
  };

  const getClientProjects = (clientId: string) => {
    return projects.filter(p => p.clientId === clientId);
  };

  const handleCrawlDocumentation = async () => {
    if (crawlMode === 'crawl' && !documentationUrl.trim()) return;
    if (crawlMode === 'specific' && !specificUrls.trim()) return;
    
    console.log('🔄 Starting crawl...');
    console.log('🔄 Current crawling state before setting:', crawling);
    setCrawling(true);
    console.log('🔄 Set crawling to true, current state should be true now');
    setCrawlResults(null);
    
    try {
      let results: CrawlResponse;
      
      if (crawlMode === 'crawl') {
        results = await crawlDocumentation(documentationUrl, 50); // Crawl up to 50 pages
        console.log('📄 Crawl completed:', results);
      } else {
        // Specific URLs mode
        const urlList = specificUrls
          .split('\n')
          .map(url => url.trim())
          .filter(url => url.length > 0 && url.startsWith('http'));
        
        console.log('📄 Scraping specific URLs:', urlList);
        
        const response = await fetch('/api/scrape-specific', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ urls: urlList }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        results = await response.json();
        console.log('📄 Specific scraping completed:', results);
      }
      
      setCrawlResults(results);
      
      if (results.success && selectedProject) {
        console.log('📊 Processing crawl results...');
        // Auto-populate with the appropriate prompt template based on video type
        setPrompt(prev => prev || getPromptTemplate(selectedProject.videoType || 'tutorial'));
        
        // Calculate summary for display purposes
        const summary = getContentSummary(results);
        console.log('📊 Summary calculated:', summary);
        console.log('📏 Content size:', results.totalContent?.length || 0, 'characters');
        console.log('📄 Pages crawled:', results.pages.length);
        
        // Save the scraped content to the project database via API
        console.log('💾 Saving scraped content to database via API...');
        console.log('📏 Total content length to save:', results.totalContent?.length || 0);
        console.log('📄 First 200 chars to save:', results.totalContent?.substring(0, 200) || 'No content');
        try {
          const response = await fetch('/api/save-scraped-content', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              projectId: selectedProject.id,
              scrapedContent: results.totalContent || '',
              scrapedPages: results.pages.length,
              scrapedChars: summary.totalCharacters,
              scrapedWords: summary.totalWords,
              scrapedUrl: crawlMode === 'crawl' ? documentationUrl : 'Multiple specific URLs'
            })
          });
          
          const data = await response.json();
          if (data.success) {
            console.log('✅ Scraped content saved to database successfully via API');
          } else {
            console.error('❌ API error saving scraped content:', data.error);
          }
        } catch (dbError) {
          console.error('❌ API save error (scraped content):', dbError);
        }
      }
    } catch (error) {
      console.error('Crawling failed:', error);
    }
    
    // Always reset crawling state, regardless of what happens above
    console.log('🏁 Crawl finished, setting crawling to false');
    console.log('🏁 Current crawling state before resetting:', crawling);
    setCrawling(false);
    console.log('🏁 Set crawling to false, should be false now');
    
    // Force a small delay to ensure React has time to process the state change
    setTimeout(() => {
      console.log('⏰ Timeout check - crawling state should be false now');
    }, 50);
  };

  const handleGenerateScript = async () => {
    // Crawling is required for script generation
    if (!crawlResults?.success) return;
    if (!prompt.trim() || !userRequest.trim()) return;
    
    console.log('🤖 Starting script generation...');
    setGenerating(true);
    setGeneratedScript('🤖 Generating script with AI...\n\nPlease wait while we create your professional video script based on the crawled documentation.');
    
    try {
      // Use stored scraped content if available, otherwise use current crawl results
      let documentationContent: string = '';
      if (selectedProject?.scrapedContent) {
        console.log('📄 Using stored scraped content from database');
        console.log('📏 Stored content length:', selectedProject.scrapedContent.length);
        console.log('📄 First 200 chars of stored content:', selectedProject.scrapedContent.substring(0, 200));
        documentationContent = selectedProject.scrapedContent;
      } else if (crawlResults?.success && crawlResults) {
        console.log('📄 Using current crawl results');
        documentationContent = aggregateContent(crawlResults);
      }

      const result = await generateScript({
        prompt: prompt,
        userRequest: userRequest,
        documentationContent: documentationContent,
        videoType: selectedProject?.videoType || 'tutorial'
      });

      console.log('📝 Script generation completed:', result.success);

      if (result.success && result.script) {
        setGeneratedScript('');
        setEditableScript(result.script);
        setHasUnsavedChanges(false);

        // Save the generated script to the project via API
        if (selectedProject) {
          try {
            console.log('💾 Saving generated script to database via API...');
            console.log('📏 Script size:', result.script.length, 'characters');
            
            const response = await fetch('/api/save-script', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                projectId: selectedProject.id,
                script: result.script
              })
            });
            
            const data = await response.json();
            if (data.success) {
              console.log('✅ Script saved to project successfully via API');
            } else {
              console.error('❌ API error saving script:', data.error);
            }
          } catch (dbError) {
            console.error('❌ API save error (script):', dbError);
          }
        }
      } else {
        setGeneratedScript(`❌ Script generation failed: ${result.error || 'Unknown error'}\n\nPlease check your internet connection and try again.`);
      }
    } catch (error) {
      console.error('Script generation error:', error);
      setGeneratedScript(`❌ Script generation failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again.`);
    }
    
    // Always reset generating state, regardless of what happens above
    console.log('🏁 Script generation finished, setting generating to false');
    console.log('🏁 Current generating state before resetting:', generating);
    setGenerating(false);
    console.log('🏁 Set generating to false, should be false now');
    
    // Force a small delay to ensure React has time to process the state change
    setTimeout(() => {
      console.log('⏰ Timeout check - generating state should be false now');
    }, 50);
  };

  const handleModifyScript = async () => {
    if (!selectedProject?.script || !modificationRequest.trim()) return;
    
    console.log('✏️ Starting script modification...');
    setModifying(true);
    setGeneratedScript('✏️ Modifying script with AI...\n\nPlease wait while we apply your requested changes to the existing script.');
    
    try {
      const response = await fetch('/api/modify-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProject.id,
          currentScript: selectedProject.script,
          modificationRequest: modificationRequest,
          documentationContent: selectedProject.scrapedContent || ''
        })
      });

      const data = await response.json();
      console.log('📝 Script modification completed:', data.success);

      if (data.success && data.script) {
        setGeneratedScript('');
        setEditableScript(data.script);
        setHasUnsavedChanges(false);
        // Update the selected project with the new script
        setSelectedProject(prev => prev ? { ...prev, script: data.script } : null);
        console.log('✅ Script modified and updated successfully');
      } else {
        setGeneratedScript(`❌ Script modification failed: ${data.error || 'Unknown error'}\n\nPlease check your request and try again.`);
      }
    } catch (error) {
      console.error('Script modification error:', error);
      setGeneratedScript(`❌ Script modification failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again.`);
    }
    
    setModifying(false);
    console.log('🏁 Script modification finished');
  };

  const handlePartialRegenerate = async () => {
    if (!selectedProject?.script || !modificationRequest.trim() || !selectedText) return;
    
    console.log('🔄 Starting partial script regeneration...');
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
          documentationContent: selectedProject.scrapedContent || ''
        }),
      });

      result = await response.json();

      if (result.success) {
        console.log('✅ Partial regeneration completed successfully');

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
        
        console.log('🔄 Regenerated portion:', result.regeneratedText.substring(0, 100) + '...');
        console.log('📏 Original length:', selectionEnd - selectionStart, '→ New length:', regeneratedLength);
        
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
    const escapeHtml = (unsafe: string) => {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\n/g, "<br>");
    };
    
    // If no selection or not in regenerating states, return plain text
    if (!selectedText || selectionStart === selectionEnd || (!isPartiallyRegenerating && !regenerationComplete)) {
      return escapeHtml(text);
    }
    
    const before = escapeHtml(text.substring(0, selectionStart));
    const selected = escapeHtml(text.substring(selectionStart, selectionEnd));
    const after = escapeHtml(text.substring(selectionEnd));
    
    if (isPartiallyRegenerating) {
      // Blue highlight with pulsing animation during regeneration
      return `${before}<span style="background-color: #3b82f6; color: #3b82f6; padding: 0; border-radius: 3px; animation: pulse 1.5s infinite;">${selected}</span>${after}`;
    } else if (regenerationComplete) {
      // Green highlight when complete
      return `${before}<span style="background-color: #10b981; color: #10b981; padding: 0; border-radius: 3px;">${selected}</span>${after}`;
    }
    
    return escapeHtml(text);
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
      console.log('📝 Text selected:', selectedPortion.substring(0, 50) + '...');
    } else {
      setSelectedText('');
      setSelectionStart(0);
      setSelectionEnd(0);
      setShowRegenerateButton(false);
    }
  };

  const handleManualScriptSave = async () => {
    if (!selectedProject || !editableScript.trim()) return;
    
    console.log('💾 Saving manually edited script...');
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
        console.log('✅ Manual script saved successfully');
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

  const handleCheckScriptUpdates = async () => {
    if (maintenanceCrawlMode === 'crawl' && !maintenanceDocUrl.trim()) return;
    if (maintenanceCrawlMode === 'specific' && !maintenanceSpecificUrls.trim()) return;
    if (!selectedProject?.script) return;

    console.log('🔍 Starting script update check...');
    setCheckingUpdates(true);
    setUpdateResults(null);

    try {
      // First, get fresh documentation content
      let freshContent: string;
      
      if (maintenanceCrawlMode === 'crawl') {
        const results = await crawlDocumentation(maintenanceDocUrl, 50);
        if (!results.success) {
          throw new Error(results.error || 'Failed to crawl documentation');
        }
        freshContent = results.totalContent || '';
      } else {
        // Specific URLs mode
        const urlList = maintenanceSpecificUrls
          .split('\n')
          .map(url => url.trim())
          .filter(url => url.length > 0 && url.startsWith('http'));
        
        const response = await fetch('/api/scrape-specific', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ urls: urlList }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const results = await response.json();
        if (!results.success) {
          throw new Error(results.error || 'Failed to scrape specific URLs');
        }
        freshContent = results.totalContent || '';
      }

      // Now check for updates using AI
      console.log('🤖 Analyzing script for outdated content...');
      const response = await fetch('/api/check-script-updates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProject.id,
          currentScript: selectedProject.script,
          freshDocumentation: freshContent
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updateData = await response.json();
      console.log('📋 Update check completed:', updateData);
      console.log('🔍 Analysis object:', updateData.analysis);
      console.log('📊 Outdated sections:', updateData.analysis?.outdated_sections);
      console.log('📊 Outdated sections length:', updateData.analysis?.outdated_sections?.length);
      setUpdateResults(updateData);
      
      // Initialize the script with overlays if updates were found
      if (updateData.success && updateData.analysis.outdated_sections?.length > 0) {
        console.log('✅ Initializing overlays with', updateData.analysis.outdated_sections.length, 'sections');
        setTimeout(() => initializeScriptWithOverlays(updateData.analysis.outdated_sections), 100);
      } else {
        console.log('❌ Not initializing overlays. Success:', updateData.success, 'Sections:', updateData.analysis?.outdated_sections?.length);
      }

    } catch (error) {
      console.error('❌ Script update check failed:', error);
      setUpdateResults({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setCheckingUpdates(false);
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

    console.log(`🔄 Replacing at index ${matchStart}: "${textToReplace.substring(0, 50)}..." with: "${suggestion.suggested_replacement.substring(0, 50)}..."`);

    const updatedScript =
      scriptWithOverlays.substring(0, matchStart) +
      suggestion.suggested_replacement +
      scriptWithOverlays.substring(matchStart + textToReplace.length);
    setScriptWithOverlays(updatedScript);
    
    // Remove this suggestion from active overlays
    const updatedOverlays = activeOverlays.filter((_, index) => index !== suggestionIndex);
    setActiveOverlays(updatedOverlays);
    
    // Update the project script in the database and main editor immediately
    updateProjectScript(updatedScript);

    // If this overlay came from the persisted cron flow (has a DB id), also
    // flip its row to 'accepted' so it stops appearing on next load.
    if (suggestion.id) {
      fetch('/api/pending-edits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editId: suggestion.id, action: 'accept' }),
      }).catch(e => console.error('Failed to mark accepted:', e));
    }

    console.log(`✅ Accepted suggestion ${suggestionIndex + 1}`);
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

    console.log(`❌ Declined suggestion ${suggestionIndex + 1}`);
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
        console.log('✅ Script updated in database');
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

    console.log('🔍 Preprocessing overlays with enhanced fuzzy matching...');
    const preprocessedOverlays = rawOverlays.map((section: any, index: number) => {
      const script = selectedProject.script!; // We already checked it exists above
      let textIndex = script.indexOf(section.original_text);
      let actualMatchedText = section.original_text;
      
      if (textIndex === -1) {
        console.log(`🔍 Exact match failed for section ${index}, trying enhanced fuzzy matching...`);
        
        // First try: Direct normalized comparison
        const normalizedAiText = normalizeText(section.original_text);
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
          const keywords = section.original_text.split(' ').filter((word: string) => 
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
          console.log(`🎯 ${matchType} match ${index} (score: ${bestScore.toFixed(2)}): "${section.original_text.substring(0, 40)}..." → "${bestMatch.substring(0, 40)}..."`);
        } else {
          console.log(`❌ No match found for section ${index}: "${section.original_text.substring(0, 50)}..."`);
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
  const ScriptWithOverlays = ({ script, overlays, onAccept, onDecline }: {
    script: string;
    overlays: any[];
    onAccept: (index: number) => void;
    onDecline: (index: number) => void;
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
                overlay.severity === 'critical' ? 'bg-red-200 border-b-2 border-red-400 hover:bg-red-300' :
                overlay.severity === 'moderate' ? 'bg-yellow-200 border-b-2 border-yellow-400 hover:bg-yellow-300' :
                'bg-blue-200 border-b-2 border-blue-400 hover:bg-blue-300'
              }`}
              onClick={() => setSelectedOverlay(overlay.originalIndex)}
              title={`Click to review: ${overlay.reason}`}
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
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Update Suggestion
                    <span className={`ml-2 text-xs font-medium px-2 py-1 rounded ${
                      overlays[selectedOverlay].severity === 'critical' ? 'bg-red-200 text-red-800' :
                      overlays[selectedOverlay].severity === 'moderate' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {overlays[selectedOverlay].severity.toUpperCase()}
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
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm mb-2">Current (Outdated):</h4>
                    <div className="bg-red-50 p-3 rounded text-sm text-gray-700 border-l-4 border-red-400">
                      {overlays[selectedOverlay].original_text}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm mb-2">Why it's outdated:</h4>
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
      <div className="min-h-screen flex items-center justify-center bg-white">
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
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-primary-600 shadow-sm flex-shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              {currentView === 'projects' && (
                <button
                  onClick={handleBackToClients}
                  className="text-white hover:text-primary-100 transition-colors duration-200 flex items-center"
                >
                  ← Back
                </button>
              )}
              {currentView === 'project-detail' && (
                <button
                  onClick={handleBackToProjects}
                  className="text-white hover:text-primary-100 transition-colors duration-200 flex items-center"
                >
                  ← Back
                </button>
              )}
              {currentView === 'script-maintenance' && (
                <button
                  onClick={handleBackToProjectDetail}
                  className="text-white hover:text-primary-100 transition-colors duration-200 flex items-center"
                >
                  ← Back to Project
                </button>
              )}
              <h1 className="text-3xl font-bold text-white">
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
                  className="bg-white text-primary-600 px-6 py-2 rounded-lg hover:bg-primary-50 transition-colors duration-200 font-medium flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Client
                </button>
              )}
              {currentView === 'projects' && (
                <>
                  {selectedClient && (
                    <button
                      onClick={() => {
                        setMonitoringRootUrl(selectedClient.monitoringRootUrl || selectedClient.scrapedUrl || '');
                        setMonitoringMessage(null);
                        setShowMonitoringModal(true);
                      }}
                      className="bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors duration-200 font-medium flex items-center text-sm"
                      title={selectedClient.monitoringEnabled ? 'Re-seed daily monitoring' : 'Set up daily monitoring'}
                    >
                      {selectedClient.monitoringEnabled ? '🔁 Monitoring active' : '🛰️ Set up monitoring'}
                    </button>
                  )}
                  <button
                    onClick={() => setShowProjectModal(true)}
                    className="bg-white text-primary-600 px-6 py-2 rounded-lg hover:bg-primary-50 transition-colors duration-200 font-medium flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </button>
                </>
              )}
              {currentView === 'project-detail' && selectedProject?.script && (
                <button
                  onClick={handleOpenScriptMaintenance}
                  className="bg-white text-primary-600 px-6 py-2 rounded-lg hover:bg-primary-50 transition-colors duration-200 font-medium flex items-center"
                >
                  🔍 Check Updates
                  {selectedProject?.pendingEditsCount && selectedProject.pendingEditsCount > 0 ? (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-orange-500 rounded-full">
                      {selectedProject.pendingEditsCount}
                    </span>
                  ) : null}
                </button>
              )}
              
              <button 
                onClick={handleLogout}
                className="text-white hover:text-primary-100 transition-colors duration-200 flex items-center"
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
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium"
                  >
                    Add Your First Client
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
                {clients.map((client) => (
                  <div key={client.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group relative">
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
          // Client View (Projects + Learning)
          <div className="h-full flex flex-col">
            {/* Mode Selection Tabs - Only show if client has documentation */}
            {selectedClient?.scrapedContent && (
              <div className="flex-shrink-0 mb-6">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                  <button
                    onClick={() => setClientMode('projects')}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      clientMode === 'projects'
                        ? 'bg-white text-primary-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Projects
                  </button>
                  <button
                    onClick={() => setClientMode('learning')}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      clientMode === 'learning'
                        ? 'bg-white text-primary-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Learn Software
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {clientMode === 'projects' 
                    ? 'Manage individual tutorial projects' 
                    : 'Learn the software with AI guidance'
                  }
                </p>
              </div>
            )}

            {clientMode === 'learning' && selectedClient?.scrapedContent ? (
              // Learning Mode
              <div className="flex-1 min-h-0">
                <LearningChat 
                  projectId={selectedClient.id} // Using client ID instead of project ID
                  softwareName={selectedClient.company || 'Software'}
                />
              </div>
            ) : (
              // Projects Mode
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
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium"
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
                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group relative"
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
                      {project.scrapedPages && project.scrapedPages > 0 && (
                        <div className="mt-2 text-xs text-primary-600">
                          📄 {project.scrapedPages} pages scraped • {project.scrapedChars?.toLocaleString()} chars
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}
              </div>
            )}
          </div>
        ) : currentView === 'script-maintenance' ? (
          // Script Maintenance View
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-8 px-2">
              {/* Crawling Interface */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Check for Documentation Updates</h2>
                
                {/* Crawl Mode Selection */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Update Check Mode</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="maintenanceCrawlMode"
                        value="crawl"
                        checked={maintenanceCrawlMode === 'crawl'}
                        onChange={(e) => setMaintenanceCrawlMode(e.target.value as 'crawl' | 'specific')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Crawl from starting URL</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="maintenanceCrawlMode"
                        value="specific"
                        checked={maintenanceCrawlMode === 'specific'}
                        onChange={(e) => setMaintenanceCrawlMode(e.target.value as 'crawl' | 'specific')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Check specific URLs</span>
                    </label>
                  </div>
                </div>

                {/* URL Input Fields */}
                {maintenanceCrawlMode === 'crawl' ? (
                  <div className="mb-6">
                    <label htmlFor="maintenanceDocUrl" className="block text-sm font-medium text-gray-700 mb-2">
                      Starting Documentation URL
                    </label>
                    <input
                      type="url"
                      id="maintenanceDocUrl"
                      value={maintenanceDocUrl}
                      onChange={(e) => setMaintenanceDocUrl(e.target.value)}
                      placeholder="https://docs.example.com/getting-started"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Will crawl up to 50 pages starting from this URL
                    </p>
                  </div>
                ) : (
                  <div className="mb-6">
                    <label htmlFor="maintenanceSpecificUrls" className="block text-sm font-medium text-gray-700 mb-2">
                      Specific URLs to Check (one per line)
                    </label>
                    <textarea
                      id="maintenanceSpecificUrls"
                      value={maintenanceSpecificUrls}
                      onChange={(e) => setMaintenanceSpecificUrls(e.target.value)}
                      placeholder="https://docs.example.com/page1&#10;https://docs.example.com/page2&#10;https://docs.example.com/page3"
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Enter the exact URLs you want to check for updates
                    </p>
                  </div>
                )}

                <button
                  onClick={handleCheckScriptUpdates}
                  disabled={checkingUpdates || (maintenanceCrawlMode === 'crawl' && !maintenanceDocUrl.trim()) || (maintenanceCrawlMode === 'specific' && !maintenanceSpecificUrls.trim())}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                    checkingUpdates || (maintenanceCrawlMode === 'crawl' && !maintenanceDocUrl.trim()) || (maintenanceCrawlMode === 'specific' && !maintenanceSpecificUrls.trim())
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {checkingUpdates ? 'Checking for Updates...' : '🔍 Check for Updates'}
                </button>
              </div>

              {/* Persisted overlays from the daily cron — show whenever there
                  are pending edits and no manual check is in flight. */}
              {!updateResults && activeOverlays.length > 0 && selectedProject?.script && (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <div className="p-4 rounded-lg mb-6 bg-yellow-50 border border-yellow-200">
                    <div className="font-medium text-yellow-800">
                      ⚠️ {activeOverlays.length} suggested update{activeOverlays.length === 1 ? '' : 's'} from daily monitoring
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
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Update Results */}
              {updateResults && (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  {updateResults.success ? (
                    <div>
                      {/* Overall Status */}
                      <div className={`p-4 rounded-lg mb-6 ${
                        updateResults.analysis.overall_status === 'current'
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-yellow-50 border border-yellow-200'
                      }`}>
                        <div className={`font-medium ${
                          updateResults.analysis.overall_status === 'current' 
                            ? 'text-green-800' 
                            : 'text-yellow-800'
                        }`}>
                          {updateResults.analysis.overall_status === 'current' 
                            ? '✅ Script is Up to Date' 
                            : `⚠️ ${activeOverlays.length} Updates Needed`}
                        </div>
                        <p className={`text-sm mt-1 ${
                          updateResults.analysis.overall_status === 'current' 
                            ? 'text-green-700' 
                            : 'text-yellow-700'
                        }`}>
                          {updateResults.analysis.overall_status === 'current' 
                            ? updateResults.analysis.summary
                            : 'Click on red highlighted sections to review and accept/decline suggestions'}
                        </p>
                      </div>

                      {/* Interactive Script with Overlays */}
                      {updateResults.analysis.outdated_sections && updateResults.analysis.outdated_sections.length > 0 && (
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-4">Script with Update Suggestions</h3>
                          <div className="bg-gray-50 text-gray-900 p-6 rounded-lg border border-gray-200 relative">
                            <ScriptWithOverlays 
                              script={scriptWithOverlays || selectedProject?.script || ''}
                              overlays={activeOverlays}
                              onAccept={handleAcceptSuggestion}
                              onDecline={handleDeclineSuggestion}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="font-medium text-red-800">❌ Error</div>
                      <p className="text-sm text-red-700 mt-1">{updateResults.error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Project Detail View
          <div className="h-full flex flex-col">
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-8 min-h-0">
                             {/* Left Column - Inputs */}
               <div className="lg:col-span-2 space-y-6 overflow-y-auto px-2">
                 {/* Documentation Scraping Section */}
                 <div className="bg-white p-4 rounded-lg border border-gray-200">
                   <label className="block text-sm font-medium text-gray-700 mb-3">
                     Documentation Scraping
                   </label>
                   

                   
                   {/* Mode Toggle */}
                   <div className="mb-4">
                     <div className="flex space-x-4">
                       <label className="flex items-center">
                         <input
                           type="radio"
                           value="crawl"
                           checked={crawlMode === 'crawl'}
                           onChange={(e) => setCrawlMode(e.target.value as 'crawl' | 'specific')}
                           className="mr-2"
                         />
                         <span className="text-sm">Crawl All Pages</span>
                       </label>
                       <label className="flex items-center">
                         <input
                           type="radio"
                           value="specific"
                           checked={crawlMode === 'specific'}
                           onChange={(e) => setCrawlMode(e.target.value as 'crawl' | 'specific')}
                           className="mr-2"
                         />
                         <span className="text-sm">Specific Pages</span>
                       </label>
                     </div>
                   </div>

                   {crawlMode === 'crawl' ? (
                     /* Crawl Mode */
                     <div>
                       <label className="block text-xs text-gray-600 mb-2">
                         Starting URL (will discover and crawl related pages)
                       </label>
                       <div className="flex space-x-3">
                         <input
                           type="url"
                           value={documentationUrl}
                           onChange={(e) => setDocumentationUrl(e.target.value)}
                           className="input-field flex-1"
                           placeholder="https://docs.example.com"
                         />
                         <button
                           onClick={() => {
                             console.log('🔘 Crawl button clicked, crawling state:', crawling);
                             handleCrawlDocumentation();
                           }}
                           disabled={crawling || !documentationUrl.trim()}
                           className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                         >
                           {crawling ? (
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                           ) : (
                             <Search className="w-4 h-4 mr-2" />
                           )}
                           {crawling ? 'Crawling...' : 'Crawl'}
                         </button>
                       </div>
                     </div>
                   ) : (
                     /* Specific URLs Mode */
                     <div>
                       <label className="block text-xs text-gray-600 mb-2">
                         Specific URLs (one per line)
                       </label>
                       <div className="space-y-3">
                         <textarea
                           value={specificUrls}
                           onChange={(e) => setSpecificUrls(e.target.value)}
                           className="input-field resize-none"
                           rows={4}
                           placeholder={`https://docs.example.com/getting-started
https://docs.example.com/user-guide
https://docs.example.com/api-reference`}
                         />
                         <button
                           onClick={() => {
                             console.log('🔘 Scrape specific button clicked, crawling state:', crawling);
                             handleCrawlDocumentation();
                           }}
                           disabled={crawling || !specificUrls.trim()}
                           className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                         >
                           {crawling ? (
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                           ) : (
                             <Search className="w-4 h-4 mr-2" />
                           )}
                           {crawling ? 'Scraping...' : 'Scrape Pages'}
                         </button>
                       </div>
                     </div>
                   )}
                   
                   {/* Crawl Results Summary */}
                                        {crawlResults && (
                       <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                         {crawlResults.success ? (
                           <div className="text-sm text-primary-700">
                             ✅ Successfully {crawlMode === 'crawl' ? 'crawled' : 'scraped'} {crawlResults.pages.length} pages
                           {(() => {
                             const summary = getContentSummary(crawlResults);
                             return (
                               <div className="mt-2 text-xs text-primary-600">
                                 📊 {summary.totalCharacters.toLocaleString()} characters • {summary.totalWords.toLocaleString()} words • Avg {summary.averagePageLength} chars/page
                               </div>
                             );
                           })()}
                           <div className="mt-3">
                             <select 
                               className="w-full text-xs bg-white border border-primary-300 rounded-md px-2 py-1 text-primary-800"
                               onChange={(e) => {
                                 if (e.target.value) {
                                   window.open(e.target.value, '_blank');
                                 }
                               }}
                               defaultValue=""
                             >
                               <option value="">📄 View crawled pages ({crawlResults.pages.length} total)</option>
                               {crawlResults.pages
                                 .sort((a, b) => b.content.length - a.content.length)
                                 .map((page, index) => (
                                 <option key={index} value={page.url}>
                                   {page.title} ({page.content.length.toLocaleString()} chars)
                                 </option>
                               ))}
                             </select>
                           </div>
                           <div className="mt-2 text-xs text-primary-600">
                             💾 All text content scraped and stored in project database
                             <br />
                             🤖 Ready for AI script generation
                           </div>
                         </div>
                       ) : (
                         <div className="text-sm text-red-600">
                           ❌ Crawling failed: {crawlResults.error}
                         </div>
                       )}
                     </div>
                   )}
                 </div>
                 
                 {/* Dynamic Content: Script Generation vs Modification */}
                 {selectedProject?.script ? (
                   /* Script Modification Mode */
                   <>
                     <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                       <div className="flex items-center mb-3">
                         <FileText className="w-5 h-5 text-blue-600 mr-2" />
                         <span className="text-sm font-medium text-blue-800">Script Modification Mode</span>
                       </div>
                       <p className="text-sm text-blue-700">
                         A script already exists for this project. Describe what changes you'd like to make, and AI will modify the existing script while preserving its structure and style.
                       </p>
                     </div>

                     <div className="bg-white p-4 rounded-lg border border-gray-200">
                       <label className="block text-sm font-medium text-gray-700 mb-3">
                         What changes would you like to make to the script? *
                       </label>
                       <textarea
                         value={modificationRequest}
                         onChange={(e) => setModificationRequest(e.target.value)}
                         className="input-field resize-none"
                         rows={4}
                         placeholder="e.g., Make the introduction shorter and more engaging, Add more examples in the setup section, Change the tone to be more casual, etc."
                       />
                     </div>

                     <div className="pt-2">
                       <button 
                         onClick={handleModifyScript}
                         disabled={!modificationRequest.trim() || modifying}
                         className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
                       >
                         {modifying ? (
                           <>
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                             Modifying Script...
                           </>
                         ) : (
                           'Modify Script with AI'
                         )}
                       </button>
                     </div>

 
                   </>
                 ) : (
                   /* Original Script Generation Mode */
                   <>
                     <div className="bg-white p-4 rounded-lg border border-gray-200">
                       <label className="block text-sm font-medium text-gray-700 mb-3">
                         What should this tutorial teach? *
                       </label>
                       <textarea
                         value={userRequest}
                         onChange={(e) => setUserRequest(e.target.value)}
                         className="input-field resize-none"
                         rows={4}
                         placeholder="e.g., How to create a new product in the system, How to set up user permissions, etc."
                       />
                     </div>

                     <div className="bg-white p-4 rounded-lg border border-gray-200">
                       <label className="block text-sm font-medium text-gray-700 mb-3">
                         AI Prompt Template
                         <span className="text-xs text-gray-500 ml-2">(Auto-filled based on video type)</span>
                       </label>
                       <textarea
                         value={prompt}
                         onChange={(e) => setPrompt(e.target.value)}
                         className="input-field resize-none text-xs"
                         rows={8}
                         placeholder="AI prompt template..."
                       />
                     </div>
                     
                     <div className="pt-2">
                       <button 
                         onClick={() => {
                           console.log('🔘 Generate button clicked, generating state:', generating);
                           handleGenerateScript();
                         }}
                                                 disabled={
                          !crawlResults?.success || 
                          !prompt.trim() || 
                          !userRequest.trim() || 
                          generating
                        }
                         className="w-full bg-primary-600 text-white py-4 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
                       >
                         {generating ? (
                           <>
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                             Generating Script...
                           </>
                         ) : (
                           'Generate Script with AI'
                         )}
                       </button>
                     </div>
                   </>
                 )}
               </div>
              
                             {/* Right Column - Generated Script */}
               <div className="lg:col-span-3 flex flex-col min-h-0">
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
                         className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
                        style={{ background: generatedScript ? undefined : 'rgba(249, 250, 251, 0.8)' }}
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
                                🔄 Regenerate Selection
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
                     Generated script will appear here...
                     <br /><br />
                     Steps:
                     <br />1. Enter documentation URL
                     <br />2. Click "Crawl" to discover all pages
                     <br />3. Describe what the tutorial should teach
                     <br />4. Click "Generate Script with AI"
                     <br /><br />
                     💡 Tip: Be specific about what you want to teach!
                   </div>
                 )}
                 
                 {hasUnsavedChanges && (
                   <div className="mt-3 flex-shrink-0">
                     <button
                       onClick={handleManualScriptSave}
                       disabled={savingScript}
                       className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
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

              {/* Documentation Scraping Section */}
              <div className="mb-4 border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Company Documentation (Optional)
                </label>
                <p className="text-xs text-gray-600 mb-4">
                  Scrape their documentation to enable AI-powered learning for their software
                </p>
                
                {/* Crawl Mode Selection */}
                <div className="mb-4">
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="crawl"
                        checked={clientCrawlMode === 'crawl'}
                        onChange={(e) => setClientCrawlMode(e.target.value as 'crawl' | 'specific')}
                        className="mr-2"
                      />
                      <span className="text-sm">Crawl from URL</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="specific"
                        checked={clientCrawlMode === 'specific'}
                        onChange={(e) => setClientCrawlMode(e.target.value as 'crawl' | 'specific')}
                        className="mr-2"
                      />
                      <span className="text-sm">Specific URLs</span>
                    </label>
                  </div>
                </div>

                {clientCrawlMode === 'crawl' ? (
                  <div className="mb-3">
                    <label className="block text-xs text-gray-600 mb-2">
                      Documentation URL
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        value={clientForm.documentationUrl}
                        onChange={(e) => setClientForm(prev => ({ ...prev, documentationUrl: e.target.value }))}
                        className="input-field flex-1 text-sm"
                        placeholder="https://docs.company.com"
                      />
                      <button
                        type="button"
                        onClick={handleClientCrawlDocumentation}
                        disabled={clientCrawling || !clientForm.documentationUrl.trim()}
                        className="px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {clientCrawling ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                        ) : (
                          <Search className="w-3 h-3 mr-1" />
                        )}
                        {clientCrawling ? 'Crawling...' : 'Crawl'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3">
                    <label className="block text-xs text-gray-600 mb-2">
                      Specific URLs (one per line)
                    </label>
                    <div className="space-y-2">
                      <textarea
                        value={clientForm.specificUrls}
                        onChange={(e) => setClientForm(prev => ({ ...prev, specificUrls: e.target.value }))}
                        className="input-field resize-none text-sm"
                        rows={3}
                        placeholder={`https://docs.company.com/getting-started
https://docs.company.com/user-guide`}
                      />
                      <button
                        type="button"
                        onClick={handleClientCrawlDocumentation}
                        disabled={clientCrawling || !clientForm.specificUrls.trim()}
                        className="w-full px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {clientCrawling ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                        ) : (
                          <Search className="w-3 h-3 mr-1" />
                        )}
                        {clientCrawling ? 'Scraping...' : 'Scrape URLs'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Crawl Results Summary */}
                {clientCrawlResults && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    {clientCrawlResults.success ? (
                      <div className="text-sm text-blue-700">
                        ✅ Successfully {clientCrawlMode === 'crawl' ? 'crawled' : 'scraped'} {clientCrawlResults.pages.length} pages
                        {(() => {
                          const summary = getContentSummary(clientCrawlResults);
                          return (
                            <div className="mt-1 text-xs text-blue-600">
                              📊 {summary.totalCharacters.toLocaleString()} characters • {summary.totalWords.toLocaleString()} words
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="text-sm text-red-600">
                        ❌ Scraping failed: {clientCrawlResults.error}
                      </div>
                    )}
                  </div>
                )}
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
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Monitoring Setup Modal */}
      {showMonitoringModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedClient.monitoringEnabled ? 'Re-seed monitoring' : 'Set up daily monitoring'}
              </h2>
              <button
                onClick={() => {
                  if (seedingMonitoring) return;
                  setShowMonitoringModal(false);
                  setMonitoringMessage(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Each day at 06:00 UTC the system re-fetches every page under this URL,
                detects meaningful changes, and queues suggested script edits for the affected videos.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Docs root URL
              </label>
              <input
                type="url"
                value={monitoringRootUrl}
                onChange={(e) => setMonitoringRootUrl(e.target.value)}
                placeholder="https://docs.example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={seedingMonitoring}
              />
              <p className="text-xs text-gray-500 mt-2">
                Will crawl up to 50 pages and store one snapshot per page. Re-running just refreshes.
              </p>

              {monitoringMessage && (
                <div className="mt-4 text-sm p-3 rounded bg-gray-50 border border-gray-200">
                  {monitoringMessage}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    if (seedingMonitoring) return;
                    setShowMonitoringModal(false);
                    setMonitoringMessage(null);
                  }}
                  disabled={seedingMonitoring}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSetupMonitoring}
                  disabled={seedingMonitoring || !monitoringRootUrl.trim()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 flex items-center"
                >
                  {seedingMonitoring && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                  {seedingMonitoring ? 'Crawling...' : (selectedClient.monitoringEnabled ? 'Re-seed' : 'Set up monitoring')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Creation Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
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
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
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