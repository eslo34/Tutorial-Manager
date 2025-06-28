import { Client, Project } from './types';

const CLIENTS_KEY = 'tutorial-workflow-clients';
const PROJECTS_KEY = 'tutorial-workflow-projects';

export const storage = {
  // Client operations
  getClients: (): Client[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(CLIENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveClients: (clients: Client[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  },

  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client => {
    const newClient: Client = {
      ...client,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const clients = storage.getClients();
    clients.push(newClient);
    storage.saveClients(clients);
    return newClient;
  },

  updateClient: (id: string, updates: Partial<Client>): Client | null => {
    const clients = storage.getClients();
    const index = clients.findIndex(c => c.id === id);
    
    if (index === -1) return null;
    
    clients[index] = { ...clients[index], ...updates, updatedAt: new Date() };
    storage.saveClients(clients);
    return clients[index];
  },

  deleteClient: (id: string): boolean => {
    const clients = storage.getClients();
    const filtered = clients.filter(c => c.id !== id);
    
    if (filtered.length === clients.length) return false;
    
    storage.saveClients(filtered);
    // Also delete associated projects
    const projects = storage.getProjects();
    const filteredProjects = projects.filter(p => p.clientId !== id);
    storage.saveProjects(filteredProjects);
    
    return true;
  },

  // Project operations
  getProjects: (): Project[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(PROJECTS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveProjects: (projects: Project[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  },

  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project => {
    const newProject: Project = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const projects = storage.getProjects();
    projects.push(newProject);
    storage.saveProjects(projects);
    return newProject;
  },

  updateProject: (id: string, updates: Partial<Project>): Project | null => {
    const projects = storage.getProjects();
    const index = projects.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    projects[index] = { ...projects[index], ...updates, updatedAt: new Date() };
    storage.saveProjects(projects);
    return projects[index];
  },

  deleteProject: (id: string): boolean => {
    const projects = storage.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    
    if (filtered.length === projects.length) return false;
    
    storage.saveProjects(filtered);
    return true;
  },

  getProjectsByClient: (clientId: string): Project[] => {
    return storage.getProjects().filter(p => p.clientId === clientId);
  },
}; 