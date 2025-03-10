import type { Metadata } from "next"
import { TradingJournal } from "@/components/journal/trading-journal"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export const metadata: Metadata = {
  title: "Trading Journal | Prop Trading Tracker",
  description: "Track and analyze your daily trading performance",
}

export default function JournalPage() {
  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Trading Journal" 
        description="Upload your trading data and visualize your performance on a calendar" 
      />
      <TradingJournal />
    </DashboardShell>
  )
} 