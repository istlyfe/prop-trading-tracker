"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const errorParam = searchParams?.get("error")
    setError(errorParam)
  }, [searchParams])
  
  const getErrorMessage = () => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration. Contact support for assistance."
      case "AccessDenied":
        return "You do not have permission to sign in."
      case "Verification":
        return "The verification link has expired or has already been used."
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
      case "OAuthAccountNotLinked":
      case "Callback":
      case "Default":
      default:
        return "An error occurred during authentication. Please try again."
    }
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center py-12">
      <div className="mx-auto grid w-full max-w-md gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{getErrorMessage()}</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/auth/signin">Back to Sign In</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 