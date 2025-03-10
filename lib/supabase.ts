import { createClient } from '@supabase/supabase-js'

// These will be replaced with actual values from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a client lazily to support build time
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabase = () => {
  // Only create the client if it hasn't been created already
  if (!supabaseClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(
        "Supabase credentials are missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in environment variables."
      )
    }
    
    supabaseClient = createClient(supabaseUrl || '', supabaseAnonKey || '')
  }
  
  return supabaseClient
}

// For compatibility with existing code
export const supabase = typeof window !== 'undefined' 
  ? getSupabase() 
  : null as unknown as ReturnType<typeof createClient>

// Database types based on our schema
export type Tables = {
  users: {
    id: string
    email: string
    name?: string
    password?: string
    created_at: string
  }
  trading_journal: {
    id: string
    user_id: string
    data: any
    last_updated: string
  }
} 