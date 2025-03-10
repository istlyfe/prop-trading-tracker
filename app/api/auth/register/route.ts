import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { supabase } from "@/lib/supabase"

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
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single()
    
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      )
    }
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Database error checking for existing user:", checkError)
      return NextResponse.json(
        { message: "Error checking for existing user" },
        { status: 500 }
      )
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    
    // Generate UUID for new user
    const userId = uuidv4()
    
    // Insert new user
    const { error: insertError } = await supabase
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
        { message: "Error creating user" },
        { status: 500 }
      )
    }
    
    // Create empty journal entry for new user
    const { error: journalError } = await supabase
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