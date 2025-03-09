"use client"

import { useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import type { Account } from "@/types/account"
import { useToast } from "@/hooks/use-toast"

// No default accounts

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Load accounts from localStorage
    const loadAccounts = () => {
      try {
        const savedAccounts = localStorage.getItem("propTracker_accounts")
        if (savedAccounts) {
          setAccounts(JSON.parse(savedAccounts))
        } else {
          // Start with empty accounts array
          setAccounts([])
          localStorage.setItem("propTracker_accounts", JSON.stringify([]))
        }
      } catch (error) {
        console.error("Error loading accounts:", error)
        toast({
          title: "Error loading accounts",
          description: "There was a problem loading your accounts data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadAccounts()
  }, [toast])

  const saveAccounts = (updatedAccounts: Account[]) => {
    try {
      localStorage.setItem("propTracker_accounts", JSON.stringify(updatedAccounts))
      setAccounts(updatedAccounts)
    } catch (error) {
      console.error("Error saving accounts:", error)
      toast({
        title: "Error saving accounts",
        description: "There was a problem saving your accounts data.",
        variant: "destructive",
      })
    }
  }

  const addAccount = (account: Omit<Account, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString()
    const newAccount: Account = {
      ...account,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      statusHistory: [
        {
          status: account.status,
          date: now,
          notes: `Account created with status: ${account.status}`,
        },
      ],
    }

    const updatedAccounts = [...accounts, newAccount]
    saveAccounts(updatedAccounts)

    toast({
      title: "Account added",
      description: `${account.firmName} account has been added successfully.`,
    })

    return newAccount
  }

  const updateAccount = (id: string, updates: Partial<Account>) => {
    const accountIndex = accounts.findIndex((acc) => acc.id === id)

    if (accountIndex === -1) {
      toast({
        title: "Account not found",
        description: "The account you're trying to update doesn't exist.",
        variant: "destructive",
      })
      return null
    }

    const updatedAccount = {
      ...accounts[accountIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    // If status is changed, add to status history
    if (updates.status && updates.status !== accounts[accountIndex].status) {
      const statusUpdate = {
        status: updates.status,
        date: updates.statusDate || new Date().toISOString(),
        notes: updates.statusNotes || `Status changed to ${updates.status}`,
      }

      updatedAccount.statusHistory = [...(updatedAccount.statusHistory || []), statusUpdate]
    }

    const updatedAccounts = [...accounts]
    updatedAccounts[accountIndex] = updatedAccount

    saveAccounts(updatedAccounts)

    toast({
      title: "Account updated",
      description: `${updatedAccount.firmName} account has been updated.`,
    })

    return updatedAccount
  }

  const deleteAccount = (id: string) => {
    const accountToDelete = accounts.find((acc) => acc.id === id)

    if (!accountToDelete) {
      toast({
        title: "Account not found",
        description: "The account you're trying to delete doesn't exist.",
        variant: "destructive",
      })
      return false
    }

    const updatedAccounts = accounts.filter((acc) => acc.id !== id)
    saveAccounts(updatedAccounts)

    toast({
      title: "Account deleted",
      description: `${accountToDelete.firmName} account has been deleted.`,
    })

    return true
  }

  const getAccountById = (id: string) => {
    return accounts.find((acc) => acc.id === id) || null
  }

  return {
    accounts,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
    getAccountById,
    saveAccounts,
  }
}

