import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          company: string
          email: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          company: string
          email?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          company?: string
          email?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          client_id: string
          title: string
          description: string
          documentation_urls: string[]
          prompt: string
          status: string
          script: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          title: string
          description: string
          documentation_urls: string[]
          prompt: string
          status: string
          script?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          title?: string
          description?: string
          documentation_urls?: string[]
          prompt?: string
          status?: string
          script?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 