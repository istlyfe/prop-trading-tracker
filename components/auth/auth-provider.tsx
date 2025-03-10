"use client"

import { SessionProvider } from "next-auth/react"
import { AuthChecker } from "./auth-checker"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthChecker>{children}</AuthChecker>
    </SessionProvider>
  )
} 