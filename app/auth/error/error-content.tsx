"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

export function ErrorContent() {
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
  
  return <p>{getErrorMessage()}</p>
} 