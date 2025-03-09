"use client"

import { useState, useEffect } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"

export function MobileHeader() {
  const { isMobile, openMobile, setOpenMobile } = useSidebar()
  const [mounted, setMounted] = useState(false)
  
  // Handle client-side rendering
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Only render on client and only on mobile
  if (!mounted) return null
  if (!isMobile) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-14 px-4 border-b bg-background md:hidden">
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden" 
        onClick={() => setOpenMobile(true)}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <span className="font-bold">Prop Trading Tracker</span>
      <ModeToggle />
    </div>
  )
} 