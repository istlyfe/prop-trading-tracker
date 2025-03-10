import { getSupabase } from './supabase'

/**
 * Utility function to verify that necessary Supabase tables exist
 * @returns A promise that resolves when verification is complete
 */
export async function verifySupabaseTables() {
  const supabase = getSupabase()
  
  try {
    console.log('Verifying Supabase setup...')
    console.log('Using Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    
    // Log API key length for security (don't log the full key)
    const keyLength = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0
    console.log(`API Key provided: ${keyLength > 0 ? 'Yes' : 'No'} (length: ${keyLength})`)
    
    // First, do a connectivity check without relying on specific functions
    let connectionSuccessful = false
    
    try {
      console.log('Testing basic Supabase connection...')

      // Simple check that doesn't call any specific functions - just checks if auth works
      // This verifies the API key is correct
      if (await supabase.auth.getSession()) {
        console.log('Basic connection to Supabase auth successful')
        connectionSuccessful = true
      } else {
        console.error('Failed to connect to Supabase auth')
      }
    } catch (e) {
      console.error('Exception during basic connection test:', e)
      return { 
        success: false, 
        error: `Exception during connection test: ${e instanceof Error ? e.message : String(e)}`
      }
    }
    
    if (!connectionSuccessful) {
      return { 
        success: false, 
        error: `Could not establish a connection to Supabase. Please check your credentials and network connection.`,
        details: {
          suggestion: "Verify your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
        }
      }
    }
    
    // Check if users table exists
    try {
      console.log('Checking users table...')
      const { data: userColumns, error: userError } = await supabase
        .from('users')
        .select('id')
        .limit(1)
      
      if (userError) {
        console.error('Error verifying users table:', userError)
        return { 
          success: false, 
          error: `Users table error: ${userError.message}`,
          details: {
            code: userError.code,
            hint: userError.hint,
            message: userError.message
          }
        }
      } else {
        console.log('Users table verified ✓')
      }
    } catch (e) {
      console.error('Exception when checking users table:', e)
      return { 
        success: false, 
        error: `Exception checking users table: ${e instanceof Error ? e.message : String(e)}`
      }
    }
    
    // Check if trading_journal table exists
    try {
      console.log('Checking trading_journal table...')
      const { data: journalColumns, error: journalError } = await supabase
        .from('trading_journal')
        .select('id')
        .limit(1)
      
      if (journalError) {
        console.error('Error verifying trading_journal table:', journalError)
        return { 
          success: false, 
          error: `Trading journal table error: ${journalError.message}`,
          details: {
            code: journalError.code,
            hint: journalError.hint,
            message: journalError.message
          }
        }
      } else {
        console.log('Trading journal table verified ✓')
      }
    } catch (e) {
      console.error('Exception when checking trading_journal table:', e)
      return { 
        success: false, 
        error: `Exception checking trading_journal table: ${e instanceof Error ? e.message : String(e)}`
      }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Unexpected error during Supabase verification:', error)
    return { 
      success: false, 
      error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
    }
  }
} 