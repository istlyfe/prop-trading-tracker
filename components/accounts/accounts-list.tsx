"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PlusCircle, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AccountCard } from "@/components/accounts/account-card"
import { useAccounts } from "@/hooks/use-accounts"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useTransactions } from "@/hooks/use-transactions"

export function AccountsList() {
  const { accounts, saveAccounts } = useAccounts()
  const { transactions, saveTransactions } = useTransactions()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredAccounts = accounts.filter(
    (account) =>
      account.firmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (account.accountName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      account.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.status.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const clearAllAccounts = () => {
    // Clear accounts from localStorage
    localStorage.removeItem("propTracker_accounts")
    saveAccounts([])
    
    // Clear transactions from localStorage
    localStorage.removeItem("propTracker_transactions")
    saveTransactions([])
    
    toast({
      title: "All accounts cleared",
      description: "All accounts and their transactions have been removed.",
    })
  }

  // Don't render real content until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="grid gap-6">
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading accounts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full max-w-sm">
          <Input
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="flex space-x-2">
          {accounts.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Trash className="h-4 w-4" />
                  <span className="hidden sm:inline">Clear All</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your accounts and their transactions.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearAllAccounts}>
                    Yes, clear all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button asChild size="sm" className="gap-1">
            <Link href="/accounts/new">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Add Account</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </Button>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Your Accounts</h2>
        
        {filteredAccounts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAccounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        ) : (
          <Card className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">
                {accounts.length === 0
                  ? "No accounts added yet. Click the button above to add your first account."
                  : "No accounts match your search. Try a different query."}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

