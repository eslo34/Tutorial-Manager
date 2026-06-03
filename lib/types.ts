export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  // Documentation fields
  scrapedContent?: string;
  scrapedPages?: number;
  scrapedChars?: number;
  scrapedWords?: number;
  scrapedAt?: Date;
  scrapedUrl?: string;
  // Daily doc-monitoring
  monitoringEnabled?: boolean;
  monitoringRootUrl?: string;
  // Code-repo source
  repoLabel?: string;
  repoSource?: 'folder' | 'zip';
  repoTree?: string[];
  repoSyncedAt?: Date;
  repoFileCount?: number;
}

export interface Project {
  id: string;
  clientId: string;
  title: string;
  description: string;
  documentationUrls: string[];
  prompt: string;
  status: ProjectStatus;
  script?: string;
  videoType: VideoType;
  // Authoring source: 'docs' (crawl documentation) or 'code' (uploaded repo + chat)
  sourceType?: 'docs' | 'code';
  // Scraped content fields
  scrapedContent?: string;
  scrapedPages?: number;
  scrapedChars?: number;
  scrapedWords?: number;
  scrapedAt?: Date;
  scrapedUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  // Daily doc-monitoring — count of pending suggested edits awaiting review
  pendingEditsCount?: number;
}

export type ProjectStatus = 'planning' | 'crawling' | 'generating' | 'completed' | 'on-hold';

export type VideoType = 'tutorial';

export interface CrawlResult {
  url: string;
  content: string;
  title: string;
  scrapedAt: Date;
}

export interface ScriptGeneration {
  projectId: string;
  prompt: string;
  crawlResults: CrawlResult[];
  generatedScript: string;
  generatedAt: Date;
}

// Learning System Types
export interface LearningSession {
  id: string;
  clientId: string;
  userId: string;
  softwareName: string;
  documentationSummary?: string;
  currentPhase: 'getting_started' | 'exploring' | 'practicing' | 'mastering';
  completionPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningTask {
  id: string;
  learningSessionId: string;
  title: string;
  description: string;
  instructions: string;
  category: string;
  difficultyLevel: number;
  estimatedMinutes?: number;
  prerequisites: string[];
  isCompleted: boolean;
  completedAt?: Date;
  userNotes?: string;
  createdAt: Date;
}

export interface LearningProgress {
  id: string;
  learningSessionId: string;
  category: string;
  masteryLevel: number;
  tasksCompleted: number;
  totalTasks: number;
  lastActivity: Date;
}

export interface LearningChatMessage {
  id: string;
  learningSessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  messageType: 'chat' | 'task_assignment' | 'progress_update' | 'guidance';
  createdAt: Date;
}

// Per-project chat for code-based script authoring
export interface ScriptChatMessage {
  id: string;
  projectId: string;
  role: 'user' | 'assistant';
  content: string;
  meta?: { filesRead?: string[]; wroteDraft?: boolean };
  createdAt: Date;
}

export type LearningPhase = 'getting_started' | 'exploring' | 'practicing' | 'mastering';

export interface LearningTaskCategory {
  name: string;
  description: string;
  estimatedTasks: number;
  prerequisites: string[];
} 