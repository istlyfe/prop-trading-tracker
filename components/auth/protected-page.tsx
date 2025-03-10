"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") {
      // Session is still loading
      return
    }

    if (status === "unauthenticated") {
      console.log("User not authenticated, redirecting to sign-in")
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  if (status === "authenticated") {
    return <>{children}</>
  }

  // This will show briefly before the redirect happens
  return <div className="flex min-h-screen items-center justify-center">Redirecting...</div>
} 