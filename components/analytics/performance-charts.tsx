"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTransactions } from "@/hooks/use-transactions"
import { useAccounts } from "@/hooks/use-accounts"
import { formatCurrency } from "@/lib/utils"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export function PerformanceCharts() {
  const { transactions } = useTransactions()
  const { accounts } = useAccounts()

  // Prepare data for monthly profit chart
  const monthlyProfitData = transactions.reduce(
    (acc, transaction) => {
      const date = new Date(transaction.date)
      const month = date.toLocaleString("default", { month: "short" })
      const year = date.getFullYear()
      const key = `${month} ${year}`

      if (!acc[key]) {
        acc[key] = { month: key, profit: 0, expenses: 0 }
      }

      if (transaction.type === "payout" || transaction.type === "profit") {
        acc[key].profit += transaction.amount
      } else if (transaction.type === "fee" || transaction.type === "expense") {
        acc[key].expenses += transaction.amount
      }

      return acc
    },
    {} as Record<string, { month: string; profit: number; expenses: number }>,
  )

  const monthlyData = Object.values(monthlyProfitData).sort((a, b) => {
    const [aMonth, aYear] = a.month.split(" ")
    const [bMonth, bYear] = b.month.split(" ")
    return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime()
  })

  // Prepare data for account status pie chart
  const accountStatusData = accounts.reduce(
    (acc, account) => {
      if (!acc[account.status]) {
        acc[account.status] = { name: account.status, value: 0 }
      }
      acc[account.status].value += 1
      return acc
    },
    {} as Record<string, { name: string; value: number }>,
  )

  const statusData = Object.values(accountStatusData)

  // Prepare data for transaction type breakdown
  const transactionTypeData = transactions.reduce(
    (acc, transaction) => {
      if (!acc[transaction.type]) {
        acc[transaction.type] = { name: transaction.type, value: 0 }
      }
      acc[transaction.type].value += transaction.amount
      return acc
    },
    {} as Record<string, { name: string; value: number }>,
  )

  const typeData = Object.values(transactionTypeData)

  return (
    <Tabs defaultValue="profit">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profit">Profit & Expenses</TabsTrigger>
        <TabsTrigger value="accounts">Account Status</TabsTrigger>
        <TabsTrigger value="transactions">Transaction Types</TabsTrigger>
      </TabsList>
      <div className="mt-4">
        <TabsContent value="profit">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Profit & Expenses</CardTitle>
              <CardDescription>Track your monthly profit and expenses over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="profit" name="Profit" fill="hsl(var(--primary))" />
                    <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--destructive))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Account Status Distribution</CardTitle>
              <CardDescription>Distribution of your accounts by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={150}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => {
                        const colors = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--warning))"]
                        return <Sector key={`cell-${index}`} fill={colors[index % colors.length]} />
                      })}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} accounts`, "Count"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Type Breakdown</CardTitle>
              <CardDescription>Breakdown of your transactions by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={150}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                    >
                      {typeData.map((entry, index) => {
                        const colors = [
                          "hsl(var(--primary))",
                          "hsl(var(--destructive))",
                          "hsl(var(--warning))",
                          "hsl(var(--secondary))",
                        ]
                        return <Sector key={`cell-${index}`} fill={colors[index % colors.length]} />
                      })}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Amount"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  )
}

