import { supabase } from './supabase';
import { Client, Project } from './types';

export const authStorage = {
  // Client operations
  getClients: async (): Promise<Client[]> => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
    
    return data.map(client => ({
      id: client.id,
      name: client.name,
      company: client.company,
      email: client.email || '',
      createdAt: new Date(client.created_at),
      updatedAt: new Date(client.updated_at),
    }));
  },

  addClient: async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: client.name,
        company: client.company,
        email: client.email || null,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding client:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      company: data.company,
      email: data.email || '',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  updateClient: async (id: string, updates: Partial<Client>): Promise<Client | null> => {
    const { data, error } = await supabase
      .from('clients')
      .update({
        name: updates.name,
        company: updates.company,
        email: updates.email || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating client:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      company: data.company,
      email: data.email || '',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  deleteClient: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting client:', error);
      return false;
    }

    return true;
  },

  // Project operations
  getProjects: async (): Promise<Project[]> => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
    
    return data.map(project => ({
      id: project.id,
      clientId: project.client_id,
      title: project.title,
      description: project.description,
      documentationUrls: project.documentation_urls,
      prompt: project.prompt,
      status: project.status as Project['status'],
      script: project.script || undefined,
      videoType: project.video_type || 'tutorial',
      scrapedContent: project.scraped_content || undefined,
      scrapedPages: project.scraped_pages || 0,
      scrapedChars: project.scraped_chars || 0,
      scrapedWords: project.scraped_words || 0,
      scrapedAt: project.scraped_at ? new Date(project.scraped_at) : undefined,
      scrapedUrl: project.scraped_url || undefined,
      createdAt: new Date(project.created_at),
      updatedAt: new Date(project.updated_at),
    }));
  },

  addProject: async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('projects')
      .insert({
        client_id: project.clientId,
        title: project.title,
        description: project.description,
        documentation_urls: project.documentationUrls,
        prompt: project.prompt,
        status: project.status,
        script: project.script || null,
        video_type: project.videoType,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding project:', error);
      return null;
    }

    return {
      id: data.id,
      clientId: data.client_id,
      title: data.title,
      description: data.description,
      documentationUrls: data.documentation_urls,
      prompt: data.prompt,
      status: data.status as Project['status'],
      script: data.script || undefined,
      videoType: data.video_type || 'tutorial',
      scrapedContent: data.scraped_content || undefined,
      scrapedPages: data.scraped_pages || 0,
      scrapedChars: data.scraped_chars || 0,
      scrapedWords: data.scraped_words || 0,
      scrapedAt: data.scraped_at ? new Date(data.scraped_at) : undefined,
      scrapedUrl: data.scraped_url || undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  deleteProject: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      return false;
    }

    return true;
  },

  getProjectsByClient: async (clientId: string): Promise<Project[]> => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
    
    return data.map(project => ({
      id: project.id,
      clientId: project.client_id,
      title: project.title,
      description: project.description,
      documentationUrls: project.documentation_urls,
      prompt: project.prompt,
      status: project.status as Project['status'],
      script: project.script || undefined,
      videoType: project.video_type || 'tutorial',
      scrapedContent: project.scraped_content || undefined,
      scrapedPages: project.scraped_pages || 0,
      scrapedChars: project.scraped_chars || 0,
      scrapedWords: project.scraped_words || 0,
      scrapedAt: project.scraped_at ? new Date(project.scraped_at) : undefined,
      scrapedUrl: project.scraped_url || undefined,
      createdAt: new Date(project.created_at),
      updatedAt: new Date(project.updated_at),
    }));
  },
}; 