"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { TransactionForm } from "@/components/transactions/transaction-form"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function NewTransactionPage() {
  const searchParams = useSearchParams()
  const [accountId, setAccountId] = useState<string | undefined>(undefined)
  
  useEffect(() => {
    // Get the accountId from search params once component mounts on client
    if (searchParams) {
      setAccountId(searchParams.get('accountId') || undefined)
    }
  }, [searchParams])

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Add Transaction"
        description="Create a new transaction"
      />
      <div className="grid gap-8">
        <TransactionForm defaultAccountId={accountId} />
      </div>
    </DashboardShell>
  )
} 