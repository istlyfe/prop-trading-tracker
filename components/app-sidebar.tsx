"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Calculator, CreditCard, LayoutDashboard, LogOut, Settings, User, X, FileSpreadsheet } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export function AppSidebar() {
  const pathname = usePathname()
  const { isMobile, openMobile, setOpenMobile } = useSidebar()
  const [mounted, setMounted] = useState(false)
  
  // Handle client-side rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  const handleLinkClick = (e: React.MouseEvent) => {
    // Prevent the sidebar from collapsing when links are clicked
    e.stopPropagation()
    
    // Close the mobile menu when a link is clicked
    if (mounted && isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 px-2" onClick={handleLinkClick}>
          <CreditCard className="h-6 w-6" />
          <span className="font-bold">Prop Tracker</span>
        </Link>
        {mounted && isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setOpenMobile(false)}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu onClick={(e) => e.stopPropagation()}>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
              <Link href="/dashboard" onClick={handleLinkClick}>
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/accounts")}>
              <Link href="/accounts" onClick={handleLinkClick}>
                <User className="h-4 w-4" />
                <span>Accounts</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/transactions")}>
              <Link href="/transactions" onClick={handleLinkClick}>
                <CreditCard className="h-4 w-4" />
                <span>Transactions</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/analytics")}>
              <Link href="/analytics" onClick={handleLinkClick}>
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/consistency")}>
              <Link href="/consistency" onClick={handleLinkClick}>
                <Calculator className="h-4 w-4" />
                <span>Consistency</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/journal")}>
              <Link href="/journal" onClick={handleLinkClick}>
                <FileSpreadsheet className="h-4 w-4" />
                <span>Journal</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings" onClick={handleLinkClick}>
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
          {(!mounted || !isMobile) && <ModeToggle />}
          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Log out</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

