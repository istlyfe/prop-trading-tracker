"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ErrorDetails {
  code?: string;
  hint?: string;
  message?: string;
}

export function DatabaseCheck() {
  const [status, setStatus] = useState<"unknown" | "checking" | "ok" | "error">("unknown")
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  
  const checkDatabase = async () => {
    setStatus("checking")
    try {
      const response = await fetch("/api/check-db")
      const data = await response.json()
      
      if (data.status === "ok") {
        setStatus("ok")
      } else {
        setStatus("error")
        setError(data.message || "Unknown database error")
        setErrorDetails(data.details || null)
        setShowDialog(true)
      }
    } catch (err) {
      setStatus("error")
      setError("Could not connect to the database check endpoint")
      setErrorDetails(null)
    }
  }
  
  useEffect(() => {
    // Check database on mount
    checkDatabase()
  }, [])
  
  if (status === "unknown" || status === "checking" || status === "ok") {
    return null
  }
  
  const createTables = () => {
    // Provide SQL instructions for creating tables
    const setupSQL = `
-- Enable UUID extension for generated IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `;

    const usersTableSQL = `
-- Create users table
CREATE TABLE public.users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  password text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable row level security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own data
CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
USING (auth.uid() = id);
    `;

    const journalTableSQL = `
-- Create trading journal table
CREATE TABLE public.trading_journal (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) NOT NULL,
  data jsonb NOT NULL,
  last_updated timestamp with time zone DEFAULT now()
);

-- Enable row level security
ALTER TABLE public.trading_journal ENABLE ROW LEVEL SECURITY;

-- Create policies for trading journal
CREATE POLICY "Users can view their own journals"
ON public.trading_journal
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journals"
ON public.trading_journal
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journals"
ON public.trading_journal
FOR UPDATE
USING (auth.uid() = user_id);
    `;

    // Copy to clipboard
    navigator.clipboard.writeText(setupSQL + '\n\n' + usersTableSQL + '\n\n' + journalTableSQL)
      .then(() => alert("SQL copied to clipboard! Paste this in your Supabase SQL editor."))
      .catch(err => console.error("Failed to copy SQL:", err));
  };
  
  return (
    <>
      <Alert variant="destructive" className="mb-4">
        <Icons.alertTriangle className="h-4 w-4" />
        <AlertTitle>Database Error</AlertTitle>
        <AlertDescription>
          There was an issue connecting to the database. Some features may not work correctly.
        </AlertDescription>
      </Alert>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Database Configuration Issue</DialogTitle>
            <DialogDescription>
              The application is having trouble connecting to the Supabase database. This might be because:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm">1. The Supabase API keys are not properly set up in your .env.local file</p>
            <p className="text-sm">2. The required database tables haven't been created</p>
            <p className="text-sm">3. There's a connection issue with Supabase</p>
            
            {error && (
              <Alert variant="destructive" className="text-xs">
                <p className="font-semibold">Error details:</p>
                <p>{error}</p>
                
                {errorDetails && (
                  <div className="mt-2 text-xs opacity-80">
                    {errorDetails.code && <p>Code: {errorDetails.code}</p>}
                    {errorDetails.hint && <p>Hint: {errorDetails.hint}</p>}
                    {errorDetails.message && <p>Message: {errorDetails.message}</p>}
                  </div>
                )}
              </Alert>
            )}
            
            <div className="mt-4">
              <p className="text-sm font-semibold">Quick Fix: Create Required Tables</p>
              <p className="text-xs mt-1">Click the button below to copy SQL commands that you can run in your Supabase SQL Editor:</p>
              <ol className="text-xs mt-2 list-decimal pl-5 space-y-1">
                <li>Go to the Supabase dashboard and select your project</li>
                <li>Click on "SQL Editor" in the left sidebar</li>
                <li>Click "New Query"</li>
                <li>Paste the SQL commands from the button below</li>
                <li>Click "Run" to execute the commands</li>
              </ol>
              <Button 
                onClick={createTables}
                size="sm"
                variant="outline"
                className="mt-2 text-xs"
              >
                Copy SQL Commands
              </Button>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col space-y-2 sm:space-y-0">
            <Button onClick={() => checkDatabase()}>
              <Icons.refresh className="mr-2 h-4 w-4" />
              Check Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 