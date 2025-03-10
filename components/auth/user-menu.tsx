"use client"

import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"
import Link from "next/link"

export function UserMenu() {
  const { data: session, status } = useSession()
  
  if (status === "loading") {
    return (
      <Button variant="ghost" size="sm" className="flex items-center gap-2">
        <Icons.spinner className="h-4 w-4 animate-spin" />
        <span className="text-xs">Loading...</span>
      </Button>
    )
  }
  
  if (status === "unauthenticated" || !session?.user) {
    return (
      <Button asChild variant="ghost" size="sm">
        <Link href="/auth/signin" className="flex items-center gap-2">
          <Icons.user className="h-4 w-4" />
          <span className="text-xs">Sign in</span>
        </Link>
      </Button>
    )
  }
  
  // Get first letter of email as fallback
  const userInitial = session.user.email ? session.user.email[0].toUpperCase() : "U"
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 p-1">
          <Avatar className="h-6 w-6">
            <AvatarImage src={session.user.image || ""} alt={session.user.name || "User"} />
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
          <span className="text-xs truncate max-w-[80px]">
            {session.user.name || session.user.email || "User"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{session.user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/auth/signout" className="cursor-pointer flex items-center gap-2">
            <Icons.logout className="h-4 w-4" />
            <span>Sign out</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 