"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"

export function AuthChecker({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    // Check if we're on a protected route
    const protectedPaths = [
      "/dashboard",
      "/analytics",
      "/accounts",
      "/transactions",
      "/journal",
      "/consistency",
    ]
    
    const isProtectedRoute = protectedPaths.some(path => 
      pathname === path || pathname.startsWith(`${path}/`)
    )
    
    console.log("Auth check:", {
      pathname,
      status,
      isProtectedRoute,
      session: session ? "exists" : "none"
    })
    
    if (status === "loading") {
      // Still loading, do nothing
      return
    }
    
    if (isProtectedRoute && status !== "authenticated") {
      // User is not authenticated but trying to access protected route
      console.log("Redirecting to sign-in: not authenticated for protected route")
      router.push("/auth/signin")
    } else if (pathname === "/auth/signin" && status === "authenticated") {
      // User is authenticated but on sign-in page
      console.log("Redirecting to dashboard: already authenticated")
      router.push("/dashboard")
    }
  }, [session, status, pathname, router])
  
  return <>{children}</>
} 