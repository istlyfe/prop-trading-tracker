import type { Metadata } from "next"
import { AccountsOverview } from "@/components/accounts/accounts-overview"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentTransactions } from "@/components/transactions/recent-transactions"

export const metadata: Metadata = {
  title: "Dashboard | Prop Trading Tracker",
  description: "Track your prop trading accounts and performance",
}

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" description="Track your prop trading accounts and performance" />
      <div className="grid gap-6">
        <DashboardStats />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <AccountsOverview className="md:col-span-1 lg:col-span-4" />
          <RecentTransactions className="md:col-span-1 lg:col-span-3" />
        </div>
      </div>
    </DashboardShell>
  )
}

