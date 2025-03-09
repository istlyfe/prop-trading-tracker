"use client"

import type { Account } from "@/types/account"

// This is a server-side function to get account by ID
// In a real app, this would fetch from a database
// For now, we'll just return null since we're using client-side storage
export function getAccountById(id: string): Account | null {
  try {
    // Get accounts from localStorage
    const accounts = localStorage.getItem("propTracker_accounts")
    if (!accounts) return null

    const parsedAccounts = JSON.parse(accounts) as Account[]
    return parsedAccounts.find(account => account.id === id) || null
  } catch (error) {
    console.error("Error fetching account:", error)
    return null
  }
}

