import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import AppleProvider from "next-auth/providers/apple"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"

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
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Check if user exists in Supabase
          const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", credentials.email)
            .single()

          if (error || !user) {
            console.error("User not found or database error:", error)
            return null
          }

          // Check if password matches (for users who signed up with credentials)
          if (user.password) {
            const isValidPassword = await bcrypt.compare(
              credentials.password,
              user.password
            )

            if (!isValidPassword) {
              console.error("Invalid password")
              return null
            }
          } else {
            // User exists but signed up with a provider (no password)
            console.error("User signed up with a provider, not credentials")
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || null,
          }
        } catch (error) {
          console.error("Error in authorization:", error)
          return null
        }
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