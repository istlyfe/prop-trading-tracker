"use client"

import { DollarSign, TrendingDown, TrendingUp, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAccounts } from "@/hooks/use-accounts"
import { useTransactions } from "@/hooks/use-transactions"
import { formatCurrency } from "@/lib/utils"

export function DashboardStats() {
  const { accounts } = useAccounts()
  const { transactions } = useTransactions()

  const totalAccounts = accounts.length
  const fundedAccounts = accounts.filter((account) => account.status === "funded").length

  const totalProfit = transactions
    .filter((tx) => tx.type === "payout")
    .reduce((sum, tx) => sum + tx.amount, 0)

  const totalExpenses = transactions
    .filter((tx) => tx.type === "evaluationFee" || tx.type === "activationFee")
    .reduce((sum, tx) => sum + tx.amount, 0)

  const netProfit = totalProfit - totalExpenses

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAccounts}</div>
          <p className="text-xs text-muted-foreground">{fundedAccounts} funded accounts</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          {netProfit >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
            {formatCurrency(netProfit)}
          </div>
          <p className="text-xs text-muted-foreground">All time net profit</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalProfit)}</div>
          <p className="text-xs text-muted-foreground">From payouts and profits</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">Fees and other expenses</p>
        </CardContent>
      </Card>
    </div>
  )
}

