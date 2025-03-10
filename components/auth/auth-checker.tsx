"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export function AuthChecker({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [showedWelcome, setShowedWelcome] = useState(false)
  
  // Check for success parameter to show welcome message
  useEffect(() => {
    if (status === "authenticated" && !showedWelcome) {
      const success = searchParams?.get("success")
      
      if (success === "true") {
        // Show welcome toast when redirected with success parameter
        toast({
          title: "Sign in successful!",
          description: `Welcome${session?.user?.name ? ', ' + session.user.name : ''}!`,
          variant: "default",
        })
        
        // Update URL to remove success parameter without refreshing page
        const newUrl = pathname
        window.history.replaceState({}, '', newUrl)
        
        setShowedWelcome(true)
      }
    }
  }, [status, searchParams, pathname, toast, session, showedWelcome])
  
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
      router.push("/dashboard?success=true")
    }
  }, [session, status, pathname, router])
  
  return <>{children}</>
} 