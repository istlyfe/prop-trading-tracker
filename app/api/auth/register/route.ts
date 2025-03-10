import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { getSupabase } from "@/lib/supabase"
import { createClient } from '@supabase/supabase-js'

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

export async function POST(request: Request) {
  try {
    const supabase = getSupabase()
    
    // Parse and validate request body
    const body = await request.json()
    const validation = registerSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid input data", errors: validation.error.format() },
        { status: 400 }
      )
    }
    
    const { name, email, password } = validation.data
    
    // Check if user with this email already exists
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id, email")
        .eq("email", email)
        .maybeSingle()
      
      // Log details for debugging
      console.log("Existing user check response:", { existingUser, error: checkError ? { code: checkError.code, message: checkError.message } : null })
      
      if (existingUser) {
        return NextResponse.json(
          { message: "User with this email already exists" },
          { status: 409 }
        )
      }
      
      // PGRST116 is "no rows returned" which is expected when the user doesn't exist
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Database error checking for existing user:", checkError)
        return NextResponse.json(
          { message: "Error checking for existing user", details: checkError.message },
          { status: 500 }
        )
      }
    } catch (err) {
      console.error("Unexpected error during user existence check:", err)
      return NextResponse.json(
        { message: "Error checking for existing user", details: "Unexpected error occurred" },
        { status: 500 }
      )
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    
    // Generate UUID for new user
    const userId = uuidv4()
    
    // Insert new user
    try {
      // Try to use service role if environment variables are available
      let adminSupabase = supabase
      
      // Check if we have service role credentials
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      
      if (serviceRoleKey && supabaseUrl) {
        // Create admin client with service role to bypass RLS
        console.log("Using service role for user creation")
        adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        })
      } else {
        console.log("No service role available, using anon key")
      }
      
      const { error: insertError } = await adminSupabase
        .from("users")
        .insert({
          id: userId,
          name,
          email,
          password: hashedPassword,
          created_at: new Date().toISOString(),
        })
      
      if (insertError) {
        console.error("Error creating user:", insertError)
        return NextResponse.json(
          { message: "Error creating user", details: insertError.message },
          { status: 500 }
        )
      }
    } catch (err) {
      console.error("Unexpected error during user creation:", err)
      return NextResponse.json(
        { message: "Error creating user", details: "Unexpected error occurred" },
        { status: 500 }
      )
    }
    
    // Create empty journal entry for new user
    try {
      // Try to use service role if environment variables are available
      let adminSupabase = supabase
      
      // Check if we have service role credentials
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      
      if (serviceRoleKey && supabaseUrl) {
        // Create admin client with service role to bypass RLS
        adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        })
      }
      
      const { error: journalError } = await adminSupabase
        .from("trading_journal")
        .insert({
          user_id: userId,
          data: JSON.stringify({ entries: [], lastUpdated: new Date().toISOString() }),
          last_updated: new Date().toISOString(),
        })
      
      if (journalError) {
        console.error("Error creating journal:", journalError)
        // Don't fail registration if journal creation fails
        // We'll handle this gracefully
      }
    } catch (err) {
      console.error("Unexpected error during journal creation:", err)
      // Don't fail registration if journal creation fails
    }
    
    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    )
    
  } catch (error) {
    console.error("Unexpected error during registration:", error)
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    )
  }
} 