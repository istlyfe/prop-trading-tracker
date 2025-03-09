"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { notFound } from "next/navigation"
import { TransactionForm } from "@/components/transactions/transaction-form"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAccounts } from "@/hooks/use-accounts"
import type { Account } from "@/types/account"

export default function NewAccountTransactionPage() {
  const params = useParams()
  const { getAccountById } = useAccounts()
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (params.id) {
      const accountData = getAccountById(params.id as string)
      setAccount(accountData)
      setLoading(false)
    }
  }, [params.id, getAccountById])
  
  // Show loading state
  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading account details...</p>
        </div>
      </DashboardShell>
    )
  }

  // Show 404 if account not found
  if (!account) {
    notFound()
    return null
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Add Transaction"
        description={`Create a new transaction for ${account.firmName}${account.accountName ? ` (${account.accountName})` : ''}`}
      />
      <div className="grid gap-8">
        <TransactionForm defaultAccountId={params.id as string} />
      </div>
    </DashboardShell>
  )
} 