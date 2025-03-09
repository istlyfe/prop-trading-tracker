import type React from "react"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex flex-1 flex-col space-y-4 p-4 md:p-8 pt-4 md:pt-6">
      {children}
    </div>
  )
}

