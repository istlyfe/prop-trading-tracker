"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { HelpCircle, InfoIcon } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TradingDay {
  id: number
  profit: number
  isValid: boolean
  percentage: number
}

export function AdvancedConsistencySheetCalculator() {
  const [tradingDays, setTradingDays] = useState<TradingDay[]>([])
  const [newProfit, setNewProfit] = useState<string>("")
  const [consistencyPercentage, setConsistencyPercentage] = useState<number>(30)
  const [profitTarget, setProfitTarget] = useState<number>(1000)
  const [needMoreTrading, setNeedMoreTrading] = useState<boolean>(false)
  const [editingDayId, setEditingDayId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<string>("")

  const addTradingDay = () => {
    const profit = Number.parseFloat(newProfit)
    if (isNaN(profit)) return

    const updatedDays = [...tradingDays, { id: Date.now(), profit, isValid: true, percentage: 0 }]
    updateTradingDays(updatedDays)
    setNewProfit("")
  }

  const startEditing = (day: TradingDay) => {
    setEditingDayId(day.id)
    setEditValue(day.profit.toString())
  }

  const saveEdit = () => {
    if (editingDayId === null) return

    const profit = Number.parseFloat(editValue)
    if (isNaN(profit)) return

    const updatedDays = tradingDays.map(day => 
      day.id === editingDayId ? { ...day, profit } : day
    )
    
    updateTradingDays(updatedDays)
    setEditingDayId(null)
    setEditValue("")
  }

  const cancelEdit = () => {
    setEditingDayId(null)
    setEditValue("")
  }

  const removeTradingDay = (id: number) => {
    const updatedDays = tradingDays.filter((day) => day.id !== id)
    updateTradingDays(updatedDays)
  }

  const updateTradingDays = (days: TradingDay[]) => {
    const totalProfit = calculateTotalProfit(days)
    const maxProfitPerDay = totalProfit * (consistencyPercentage / 100)

    const validatedDays = days.map((day) => ({
      ...day,
      isValid: day.profit <= maxProfitPerDay,
      percentage: totalProfit !== 0 ? (day.profit / totalProfit) * 100 : 0,
    }))

    setTradingDays(validatedDays)
    checkTradingStatus(totalProfit)
  }

  const calculateTotalProfit = (days: TradingDay[]): number => {
    return days.reduce((sum, day) => sum + day.profit, 0)
  }

  const checkTradingStatus = (totalProfit: number) => {
    const maxProfitPerDay = totalProfit * (consistencyPercentage / 100)
    setNeedMoreTrading(maxProfitPerDay > profitTarget * (consistencyPercentage / 100))
  }

  useEffect(() => {
    updateTradingDays(tradingDays)
  }, [consistencyPercentage, profitTarget])

  const totalProfit = calculateTotalProfit(tradingDays)
  const maxProfitPerDay = totalProfit * (consistencyPercentage / 100)

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Advanced Consistency Sheet Calculator</CardTitle>
        <p className="text-sm text-muted-foreground">
          Set your custom consistency percentage and profit target. The calculator ensures each trading day doesn't
          exceed the set percentage of the overall profit.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="consistency">Consistency Percentage: {consistencyPercentage}%</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>The maximum percentage of total profit allowed for a single trading day.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center space-x-2">
              <Slider
                id="consistency"
                min={1}
                max={100}
                step={1}
                value={[consistencyPercentage]}
                onValueChange={(value) => setConsistencyPercentage(value[0])}
                className="flex-grow"
              />
              <Input
                type="number"
                value={consistencyPercentage}
                onChange={(e) => setConsistencyPercentage(Number(e.target.value))}
                className="w-20"
                min={1}
                max={100}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="target">Profit Target</Label>
            <Input
              id="target"
              type="number"
              value={profitTarget}
              onChange={(e) => setProfitTarget(Number(e.target.value))}
              min="0"
            />
          </div>
        </div>

        <div className="flex space-x-2 mb-4">
          <Input
            type="number"
            placeholder="Enter profit/loss"
            value={newProfit}
            onChange={(e) => setNewProfit(e.target.value)}
            className="flex-grow"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newProfit !== '') {
                e.preventDefault();
                addTradingDay();
              }
            }}
            disabled={editingDayId !== null}
          />
          <Button 
            onClick={addTradingDay} 
            disabled={newProfit === '' || editingDayId !== null}
          >
            Add Day
          </Button>
        </div>

        {editingDayId !== null && (
          <Alert className="mb-4">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Editing in progress</AlertTitle>
            <AlertDescription>
              Please save or cancel your current edit before adding a new trading day.
            </AlertDescription>
          </Alert>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Day</TableHead>
              <TableHead>Profit/Loss</TableHead>
              <TableHead>% of Total</TableHead>
              <TableHead>Valid</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tradingDays.map((day, index) => (
              <TableRow key={day.id} className={day.isValid ? "" : "bg-red-100 dark:bg-red-900/50"}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {editingDayId === day.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-28"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            saveEdit();
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            cancelEdit();
                          }
                        }}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={saveEdit} 
                        className="h-7 px-2 text-green-600"
                      >
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={cancelEdit}
                        className="h-7 px-2"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <span>${day.profit.toFixed(2)}</span>
                  )}
                </TableCell>
                <TableCell>{day.percentage.toFixed(2)}%</TableCell>
                <TableCell>{day.isValid ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {editingDayId !== day.id && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => startEditing(day)}
                        className="h-7 px-2"
                      >
                        Edit
                      </Button>
                    )}
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => removeTradingDay(day.id)}
                      className="h-7 px-2"
                    >
                      Remove
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 space-y-2">
          <p className="text-lg font-semibold">Total Profit: ${totalProfit.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">
            Maximum allowed profit per day ({consistencyPercentage}%): ${maxProfitPerDay.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">Profit Target: ${profitTarget.toFixed(2)}</p>
        </div>

        {needMoreTrading && (
          <Alert className="mt-4">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Trading Status</AlertTitle>
            <AlertDescription>
              You need to trade more to stay under the consistency threshold. Your current maximum profit per day ($
              {maxProfitPerDay.toFixed(2)}) exceeds {consistencyPercentage}% of your profit target ($
              {(profitTarget * (consistencyPercentage / 100)).toFixed(2)}).
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
} 