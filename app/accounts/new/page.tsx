import { Metadata } from "next"
import { AccountForm } from "@/components/accounts/account-form"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export const metadata: Metadata = {
  title: "Add Account | Prop Trading Tracker",
  description: "Add a new prop trading account",
}

export default function NewAccountPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Add Account"
        description="Create a new prop trading account"
      />
      <div className="grid gap-8">
        <AccountForm />
      </div>
    </DashboardShell>
  )
} 