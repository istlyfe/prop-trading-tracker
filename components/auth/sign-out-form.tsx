"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import Link from "next/link"

export function SignOutForm() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut({ callbackUrl: "/" })
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex flex-col space-y-3">
        <Button 
          variant="destructive" 
          onClick={handleSignOut}
          disabled={isLoading}
          className="relative"
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.logout className="mr-2 h-4 w-4" />
          )}
          Sign out
        </Button>
        
        <Button variant="outline" asChild>
          <Link href="/dashboard">Cancel</Link>
        </Button>
      </div>
    </Card>
  )
} 