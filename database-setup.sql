-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create clients table
CREATE TABLE public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    email TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create projects table
CREATE TABLE public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    documentation_urls TEXT[] DEFAULT '{}',
    prompt TEXT NOT NULL,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'crawling', 'generating', 'completed', 'on-hold')),
    script TEXT,
    -- Scraped content storage
    scraped_content TEXT, -- All scraped documentation content
    scraped_pages INTEGER DEFAULT 0, -- Number of pages scraped
    scraped_chars INTEGER DEFAULT 0, -- Total characters scraped
    scraped_words INTEGER DEFAULT 0, -- Total words scraped
    scraped_at TIMESTAMP WITH TIME ZONE, -- When content was last scraped
    scraped_url TEXT, -- The starting URL that was crawled
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security on tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for clients table
CREATE POLICY "Users can view their own clients" ON public.clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients" ON public.clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" ON public.clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" ON public.clients
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for projects table
CREATE POLICY "Users can view their own projects" ON public.projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON public.projects
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER on_clients_updated
    BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_projects_updated
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Migration script to add scraped content columns to existing projects table
-- Run this if you already have a projects table:
/*
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS scraped_content TEXT,
ADD COLUMN IF NOT EXISTS scraped_pages INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scraped_chars INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scraped_words INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scraped_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS scraped_url TEXT;
*/ 