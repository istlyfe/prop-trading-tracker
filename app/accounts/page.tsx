import type { Metadata } from "next"
import { AccountsList } from "@/components/accounts/accounts-list"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export const metadata: Metadata = {
  title: "Accounts | Prop Trading Tracker",
  description: "Manage your prop trading accounts",
}

export default function AccountsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Accounts" description="Manage your prop trading accounts" />
      <AccountsList />
    </DashboardShell>
  )
}

