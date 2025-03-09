"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { TransactionForm } from "@/components/transactions/transaction-form"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

function TransactionPageContent() {
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

export default function NewTransactionPage() {
  return (
    <Suspense fallback={
      <DashboardShell>
        <DashboardHeader
          heading="Add Transaction"
          description="Create a new transaction"
        />
        <div className="grid gap-8">
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading transaction form...</p>
          </div>
        </div>
      </DashboardShell>
    }>
      <TransactionPageContent />
    </Suspense>
  )
} 