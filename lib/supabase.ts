import { createClient } from '@supabase/supabase-js'

// These will be replaced with actual values from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase credentials are missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local"
  )
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// Database types based on our schema
export type Tables = {
  users: {
    id: string
    email: string
    created_at: string
  }
  trading_journal: {
    id: string
    user_id: string
    data: any
    last_updated: string
  }
} 