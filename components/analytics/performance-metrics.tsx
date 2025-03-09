"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransactions } from "@/hooks/use-transactions"
import { useAccounts } from "@/hooks/use-accounts"
import { formatCurrency } from "@/lib/utils"

export function PerformanceMetrics() {
  const { transactions } = useTransactions()
  const { accounts } = useAccounts()

  // Calculate total profit
  const totalProfit = transactions
    .filter((tx) => tx.type === "payout" || tx.type === "profit")
    .reduce((sum, tx) => sum + tx.amount, 0)

  // Calculate total expenses
  const totalExpenses = transactions
    .filter((tx) => tx.type === "fee" || tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0)

  // Calculate net profit
  const netProfit = totalProfit - totalExpenses

  // Calculate ROI
  const totalInvestment = transactions.filter((tx) => tx.type === "fee").reduce((sum, tx) => sum + tx.amount, 0)

  const roi = totalInvestment > 0 ? ((netProfit / totalInvestment) * 100).toFixed(2) : "N/A"

  // Calculate account metrics
  const totalAccounts = accounts.length
  const fundedAccounts = accounts.filter((account) => account.status === "funded").length
  const blownAccounts = accounts.filter((account) => account.status === "blown").length
  const fundedRate = totalAccounts > 0 ? ((fundedAccounts / totalAccounts) * 100).toFixed(2) : "0.00"

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
            {formatCurrency(netProfit)}
          </div>
          <p className="text-xs text-muted-foreground">Total profit minus expenses</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ROI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${Number(roi) >= 0 ? "text-green-500" : "text-red-500"}`}>
            {roi === "N/A" ? roi : `${roi}%`}
          </div>
          <p className="text-xs text-muted-foreground">Return on investment</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Funded Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{fundedRate}%</div>
          <p className="text-xs text-muted-foreground">
            {fundedAccounts} of {totalAccounts} accounts funded
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Blown Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalAccounts > 0 ? ((blownAccounts / totalAccounts) * 100).toFixed(2) : "0.00"}%
          </div>
          <p className="text-xs text-muted-foreground">
            {blownAccounts} of {totalAccounts} accounts blown
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

