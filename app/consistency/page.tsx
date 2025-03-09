import type { Metadata } from "next"
import { ConsistencyCalculator } from "@/components/consistency/consistency-calculator"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export const metadata: Metadata = {
  title: "Consistency Calculator | Prop Trading Tracker",
  description: "Calculate your trading consistency",
}

export default function ConsistencyPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Consistency Calculator" description="Calculate your trading consistency" />
      <ConsistencyCalculator />
    </DashboardShell>
  )
}

