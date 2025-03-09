import type { Metadata } from "next"
import { AdvancedConsistencySheetCalculator } from "@/components/consistency/advanced-consistency-calculator"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export const metadata: Metadata = {
  title: "Advanced Consistency Calculator | Prop Trading Tracker",
  description: "Calculate and maintain your trading consistency percentage",
}

export default function ConsistencyPage() {
  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Advanced Consistency Calculator" 
        description="Calculate your consistency percentage and maintain proper risk distribution across your trading days" 
      />
      <AdvancedConsistencySheetCalculator />
    </DashboardShell>
  )
}

