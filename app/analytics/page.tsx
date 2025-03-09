import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { PerformanceCharts } from "@/components/analytics/performance-charts"
import { PerformanceMetrics } from "@/components/analytics/performance-metrics"

export const metadata: Metadata = {
  title: "Analytics | Prop Trading Tracker",
  description: "Analyze your prop trading performance",
}

export default function AnalyticsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Analytics" description="Analyze your prop trading performance" />
      <div className="grid gap-6">
        <PerformanceMetrics />
        <PerformanceCharts />
      </div>
    </DashboardShell>
  )
}

