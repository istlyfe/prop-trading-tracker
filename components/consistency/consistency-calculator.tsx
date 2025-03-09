"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ConsistencyResults } from "@/components/consistency/consistency-results"

interface TradingDay {
  date: string
  profit: number
}

export function ConsistencyCalculator() {
  const [accountSize, setAccountSize] = useState<number>(100000)
  const [tradingDays, setTradingDays] = useState<TradingDay[]>([
    { date: new Date().toISOString().split("T")[0], profit: 0 },
  ])
  const [bulkInput, setBulkInput] = useState<string>("")
  const [results, setResults] = useState<any>(null)

  const addTradingDay = () => {
    setTradingDays([...tradingDays, { date: new Date().toISOString().split("T")[0], profit: 0 }])
  }

  const updateTradingDay = (index: number, field: keyof TradingDay, value: string) => {
    const updatedDays = [...tradingDays]
    if (field === "date") {
      updatedDays[index].date = value
    } else if (field === "profit") {
      updatedDays[index].profit = Number.parseFloat(value) || 0
    }
    setTradingDays(updatedDays)
  }

  const removeTradingDay = (index: number) => {
    const updatedDays = [...tradingDays]
    updatedDays.splice(index, 1)
    setTradingDays(updatedDays)
  }

  const processBulkInput = () => {
    try {
      // Parse CSV or line-by-line format: date,profit
      const lines = bulkInput.split("\n").filter((line) => line.trim())
      const newDays: TradingDay[] = lines.map((line) => {
        const [date, profitStr] = line.split(",").map((s) => s.trim())
        const profit = Number.parseFloat(profitStr) || 0
        return { date, profit }
      })

      if (newDays.length > 0) {
        setTradingDays(newDays)
      }
    } catch (error) {
      console.error("Error parsing bulk input:", error)
    }
  }

  const calculateConsistency = () => {
    if (tradingDays.length < 2) {
      return
    }

    // Sort trading days by date
    const sortedDays = [...tradingDays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Calculate metrics
    const totalDays = sortedDays.length
    const totalProfit = sortedDays.reduce((sum, day) => sum + day.profit, 0)
    const averageProfit = totalProfit / totalDays
    const profitableDays = sortedDays.filter((day) => day.profit > 0).length
    const unprofitableDays = sortedDays.filter((day) => day.profit < 0).length
    const profitablePercentage = (profitableDays / totalDays) * 100

    // Calculate standard deviation
    const variance =
      sortedDays.reduce((sum, day) => {
        const diff = day.profit - averageProfit
        return sum + diff * diff
      }, 0) / totalDays
    const stdDeviation = Math.sqrt(variance)

    // Calculate consistency score (lower std deviation relative to average profit is better)
    const consistencyScore = averageProfit !== 0 ? (1 - stdDeviation / Math.abs(averageProfit)) * 100 : 0

    // Calculate percentage of account
    const percentOfAccount = (totalProfit / accountSize) * 100

    // Calculate drawdown
    let maxDrawdown = 0
    let currentDrawdown = 0
    let peak = 0
    let runningTotal = 0

    sortedDays.forEach((day) => {
      runningTotal += day.profit

      if (runningTotal > peak) {
        peak = runningTotal
        currentDrawdown = 0
      } else {
        currentDrawdown = peak - runningTotal
        if (currentDrawdown > maxDrawdown) {
          maxDrawdown = currentDrawdown
        }
      }
    })

    const maxDrawdownPercentage = (maxDrawdown / accountSize) * 100

    setResults({
      totalDays,
      totalProfit,
      averageProfit,
      profitableDays,
      unprofitableDays,
      profitablePercentage,
      stdDeviation,
      consistencyScore: Math.max(0, consistencyScore),
      percentOfAccount,
      maxDrawdown,
      maxDrawdownPercentage,
      tradingDays: sortedDays,
    })
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Consistency Calculator</CardTitle>
          <CardDescription>Track your daily trading results and analyze your consistency</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
            </TabsList>
            <div className="mt-4 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="accountSize">Account Size</Label>
                <Input
                  id="accountSize"
                  type="number"
                  value={accountSize}
                  onChange={(e) => setAccountSize(Number(e.target.value))}
                  placeholder="Enter account size"
                />
              </div>

              <TabsContent value="manual" className="space-y-4 mt-4">
                {tradingDays.map((day, index) => (
                  <div key={index} className="grid gap-4 grid-cols-12 items-end">
                    <div className="col-span-5">
                      <Label htmlFor={`date-${index}`}>Date</Label>
                      <Input
                        id={`date-${index}`}
                        type="date"
                        value={day.date}
                        onChange={(e) => updateTradingDay(index, "date", e.target.value)}
                      />
                    </div>
                    <div className="col-span-5">
                      <Label htmlFor={`profit-${index}`}>Profit/Loss</Label>
                      <Input
                        id={`profit-${index}`}
                        type="number"
                        value={day.profit}
                        onChange={(e) => updateTradingDay(index, "profit", e.target.value)}
                        placeholder="Enter profit or loss"
                      />
                    </div>
                    <div className="col-span-2 flex gap-2">
                      {tradingDays.length > 1 && (
                        <Button variant="destructive" size="icon" onClick={() => removeTradingDay(index)}>
                          -
                        </Button>
                      )}
                      {index === tradingDays.length - 1 && (
                        <Button variant="outline" size="icon" onClick={addTradingDay}>
                          +
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="bulk" className="space-y-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="bulkInput">Bulk Input (CSV format: date,profit)</Label>
                  <Textarea
                    id="bulkInput"
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    placeholder="Enter data in format: YYYY-MM-DD,profit"
                    rows={5}
                  />
                  <p className="text-sm text-muted-foreground">Example: 2023-01-01,500</p>
                  <Button onClick={processBulkInput}>Process Bulk Input</Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button onClick={calculateConsistency} className="w-full">
            Calculate Consistency
          </Button>
        </CardFooter>
      </Card>

      {results && <ConsistencyResults results={results} accountSize={accountSize} />}
    </div>
  )
}

