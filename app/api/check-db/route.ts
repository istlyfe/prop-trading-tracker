import { NextResponse } from "next/server"
import { verifySupabaseTables } from "@/lib/supabase-verify"

export async function GET() {
  try {
    const result = await verifySupabaseTables()
    
    if (result.success) {
      return NextResponse.json({
        status: "ok",
        message: "Supabase tables verified successfully"
      })
    } else {
      return NextResponse.json({
        status: "error",
        message: result.error || "Supabase tables verification failed",
        details: result.details || null
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Error checking database:", error)
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Error checking database"
    }, { status: 500 })
  }
} 