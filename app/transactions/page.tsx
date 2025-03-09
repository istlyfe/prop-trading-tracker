import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { TransactionsList } from "@/components/transactions/transactions-list"

export const metadata: Metadata = {
  title: "Transactions | Prop Trading Tracker",
  description: "Manage your prop trading transactions",
}

export default function TransactionsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Transactions" description="Manage your prop trading transactions" />
      <TransactionsList />
    </DashboardShell>
  )
}

