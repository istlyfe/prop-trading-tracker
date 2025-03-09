import type React from "react"

interface DashboardHeaderProps {
  heading: string
  description?: string
  children?: React.ReactNode
}

export function DashboardHeader({ heading, description, children }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
      <div className="grid gap-1">
        <h1 className="font-heading text-2xl font-bold md:text-3xl">{heading}</h1>
        {description && <p className="text-sm md:text-base text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex-shrink-0 mt-2 sm:mt-0">{children}</div>}
    </div>
  )
}

