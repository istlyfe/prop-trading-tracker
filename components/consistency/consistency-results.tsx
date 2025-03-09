"use client"

import { TabsContent } from "@/components/ui/tabs"

import { TabsTrigger } from "@/components/ui/tabs"

import { TabsList } from "@/components/ui/tabs"

import { Tabs } from "@/components/ui/tabs"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface ConsistencyResultsProps {
  results: {
    totalDays: number
    totalProfit: number
    averageProfit: number
    profitableDays: number
    unprofitableDays: number
    profitablePercentage: number
    stdDeviation: number
    consistencyScore: number
    percentOfAccount: number
    maxDrawdown: number
    maxDrawdownPercentage: number
    tradingDays: Array<{ date: string; profit: number }>
  }
  accountSize: number
}

export function ConsistencyResults({ results, accountSize }: ConsistencyResultsProps) {
  // Prepare chart data
  const chartData = results.tradingDays.map((day) => ({
    date: day.date,
    profit: day.profit,
  }))

  // Prepare cumulative chart data
  const cumulativeData = results.tradingDays.reduce(
    (acc, day, index) => {
      const previousTotal = index > 0 ? acc[index - 1].total : 0
      acc.push({
        date: day.date,
        total: previousTotal + day.profit,
      })
      return acc
    },
    [] as Array<{ date: string; total: number }>,
  )

  // Calculate consistency rating
  let consistencyRating = "Poor"
  if (results.consistencyScore > 80) {
    consistencyRating = "Excellent"
  } else if (results.consistencyScore > 60) {
    consistencyRating = "Good"
  } else if (results.consistencyScore > 40) {
    consistencyRating = "Average"
  } else if (results.consistencyScore > 20) {
    consistencyRating = "Below Average"
  }

  // Calculate risk rating based on max drawdown
  let riskRating = "Low"
  if (results.maxDrawdownPercentage > 20) {
    riskRating = "Very High"
  } else if (results.maxDrawdownPercentage > 15) {
    riskRating = "High"
  } else if (results.maxDrawdownPercentage > 10) {
    riskRating = "Medium"
  } else if (results.maxDrawdownPercentage > 5) {
    riskRating = "Low-Medium"
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Consistency Analysis</CardTitle>
          <CardDescription>Analysis of your trading consistency</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Total Days</p>
              <p className="text-2xl font-bold">{results.totalDays}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Total Profit</p>
              <p className={`text-2xl font-bold ${results.totalProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatCurrency(results.totalProfit)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Average Daily</p>
              <p className={`text-2xl font-bold ${results.averageProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatCurrency(results.averageProfit)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Win Rate</p>
              <p className="text-2xl font-bold">{results.profitablePercentage.toFixed(2)}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Consistency Score</p>
              <p className="text-2xl font-bold">{results.consistencyScore.toFixed(2)}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Rating</p>
              <p className="text-2xl font-bold">{consistencyRating}</p>
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-medium">Account Performance</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm">Percent of Account</p>
                <p className={`text-lg font-bold ${results.percentOfAccount >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {results.percentOfAccount.toFixed(2)}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm">Max Drawdown</p>
                <p className="text-lg font-bold text-red-500">{results.maxDrawdownPercentage.toFixed(2)}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm">Risk Rating</p>
                <p className="text-lg font-bold">{riskRating}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Chart</CardTitle>
          <CardDescription>Visualization of your trading performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="daily">Daily P&L</TabsTrigger>
              <TabsTrigger value="cumulative">Cumulative</TabsTrigger>
            </TabsList>
            <div className="h-[300px] mt-4">
              <TabsContent value="daily">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getMonth() + 1}/${date.getDate()}`
                      }}
                    />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                    />
                    <Line type="monotone" dataKey="profit" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="cumulative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cumulativeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getMonth() + 1}/${date.getDate()}`
                      }}
                    />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                    />
                    <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

