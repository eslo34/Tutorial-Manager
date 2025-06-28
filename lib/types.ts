export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
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
  // Scraped content fields
  scrapedContent?: string;
  scrapedPages?: number;
  scrapedChars?: number;
  scrapedWords?: number;
  scrapedAt?: Date;
  scrapedUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectStatus = 'planning' | 'crawling' | 'generating' | 'completed' | 'on-hold';

export type VideoType = 'tutorial' | 'other';

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