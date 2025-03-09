"use client"

import { useEffect, useState } from "react"
import { notFound, useParams } from "next/navigation"
import { AccountDetails } from "@/components/accounts/account-details"
import { AccountHeader } from "@/components/accounts/account-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAccounts } from "@/hooks/use-accounts"
import type { Account } from "@/types/account"

export default function AccountPage() {
  const params = useParams()
  const { getAccountById } = useAccounts()
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch the account data when component mounts
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
      <AccountHeader account={account} />
      <AccountDetails account={account} />
    </DashboardShell>
  )
}

