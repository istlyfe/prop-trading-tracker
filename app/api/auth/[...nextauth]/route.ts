import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import AppleProvider from "next-auth/providers/apple"
import { supabase } from "@/lib/supabase"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: {
        appleId: process.env.APPLE_ID!,
        teamId: process.env.APPLE_TEAM_ID!,
        privateKey: process.env.APPLE_PRIVATE_KEY!,
        keyId: process.env.APPLE_KEY_ID!,
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        console.error("Sign-in failed: User email is missing")
        return false
      }
      
      try {
        // Check if user exists in Supabase
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("email", user.email)
          .single()
        
        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          console.error("Error fetching user from Supabase:", fetchError)
          // Continue with authentication but log the error
        }
        
        // If user doesn't exist, create a new one
        if (!existingUser) {
          const { error: insertUserError } = await supabase.from("users").insert({
            id: user.id,
            email: user.email,
            created_at: new Date().toISOString(),
          })
          
          if (insertUserError) {
            console.error("Error creating user in Supabase:", insertUserError)
            // Continue with authentication but log the error
          }
          
          // Create empty journal entry
          const { error: insertJournalError } = await supabase.from("trading_journal").insert({
            user_id: user.id,
            data: JSON.stringify({ entries: [], lastUpdated: new Date().toISOString() }),
            last_updated: new Date().toISOString(),
          })
          
          if (insertJournalError) {
            console.error("Error creating journal in Supabase:", insertJournalError)
            // Continue with authentication but log the error
          }
        }
        
        return true
      } catch (error) {
        console.error("Unexpected error during sign-in:", error)
        // Allow sign-in to proceed even if Supabase operations fail
        return true
      }
    },
    async session({ session, user }) {
      // Add user ID to session
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
})

export { handler as GET, handler as POST } 