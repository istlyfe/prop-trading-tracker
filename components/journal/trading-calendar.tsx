"use client"

import { useState } from "react"
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useTradingJournal } from "@/hooks/use-trading-journal"
import { formatCurrency } from "@/lib/utils"
import { TradesList } from "@/components/journal/trades-list"

export function TradingCalendar() {
  const { journalData } = useTradingJournal()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const firstDayOfMonth = startOfMonth(currentMonth)
  const lastDayOfMonth = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth })

  // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
  const startingDayIndex = firstDayOfMonth.getDay()
  
  // Get entries for the current month
  const entriesMap = new Map(
    journalData.entries
      .filter(entry => {
        const entryDate = new Date(entry.date)
        return isSameMonth(entryDate, currentMonth)
      })
      .map(entry => [entry.date, entry])
  )
  
  // Find the maximum absolute P&L for color intensity scaling
  const maxPnl = Math.max(
    1,
    ...Array.from(entriesMap.values()).map(entry => Math.abs(entry.totalPnl))
  )

  const getPnlColor = (pnl: number) => {
    if (pnl === 0) return 'bg-gray-100 dark:bg-gray-800'
    
    // Calculate intensity (0-100%)
    const intensity = Math.min(Math.abs(pnl) / maxPnl, 1) * 100
    
    if (pnl > 0) {
      return `bg-green-${Math.round(intensity / 10) * 100} dark:bg-green-${Math.round(intensity / 20) * 100 + 800}`
    } else {
      return `bg-red-${Math.round(intensity / 10) * 100} dark:bg-red-${Math.round(intensity / 20) * 100 + 800}`
    }
  }
  
  const getEntryForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    return entriesMap.get(dateStr) || null
  }
  
  const previousMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() - 1)
      return newDate
    })
  }
  
  const nextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + 1)
      return newDate
    })
  }
  
  const handleDayClick = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const entry = entriesMap.get(dateStr)
    
    if (entry && entry.trades.length > 0) {
      setSelectedDate(day)
      setIsDialogOpen(true)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Trading Calendar</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </div>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          View your daily trading performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-2 text-sm font-medium">
              {day}
            </div>
          ))}
          
          {/* Empty cells before first day of month */}
          {Array.from({ length: startingDayIndex }).map((_, index) => (
            <div key={`empty-start-${index}`} className="aspect-square p-1">
              <div className="h-full rounded-md"></div>
            </div>
          ))}
          
          {/* Days of the month */}
          {daysInMonth.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const entry = entriesMap.get(dateStr)
            const hasTrades = entry && entry.trades.length > 0
            
            let dayClasses = "flex flex-col justify-between h-full rounded-md p-1 cursor-pointer transition-colors"
            
            if (isToday(day)) {
              dayClasses += " border-2 border-primary"
            }
            
            if (hasTrades) {
              dayClasses += ` ${getPnlColor(entry.totalPnl)}`
            } else {
              dayClasses += " bg-muted/30 hover:bg-muted"
            }
            
            return (
              <div key={dateStr} className="aspect-square p-1">
                <div 
                  className={dayClasses}
                  onClick={() => hasTrades && handleDayClick(day)}
                >
                  <div className="text-xs font-medium">{format(day, 'd')}</div>
                  {hasTrades && (
                    <div className={`text-xs font-medium ${entry.totalPnl >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                      {formatCurrency(entry.totalPnl)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          
          {/* Empty cells after last day of month */}
          {Array.from({ length: 6 - lastDayOfMonth.getDay() }).map((_, index) => (
            <div key={`empty-end-${index}`} className="aspect-square p-1">
              <div className="h-full rounded-md"></div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <div>Colors indicate P&L performance: green for profit, red for loss.</div>
        <div>Click on a day with trades to view details.</div>
      </CardFooter>

      {/* Day Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
            <DialogDescription>
              Trading activity for this day
            </DialogDescription>
          </DialogHeader>
          
          {selectedDate && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {(() => {
                  const dateStr = format(selectedDate, 'yyyy-MM-dd')
                  const entry = entriesMap.get(dateStr)
                  
                  if (!entry) return null
                  
                  return (
                    <>
                      <Card className="p-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Total P&L</h4>
                        <p className={`text-xl font-bold ${entry.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(entry.totalPnl)}
                        </p>
                      </Card>
                      
                      <Card className="p-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Win Rate</h4>
                        <p className="text-xl font-bold">
                          {entry.trades.length > 0 
                            ? `${Math.round((entry.winningTrades / entry.trades.length) * 100)}%` 
                            : '0%'}
                        </p>
                      </Card>
                      
                      <Card className="p-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Trades</h4>
                        <p className="text-xl font-bold">{entry.trades.length}</p>
                      </Card>
                    </>
                  )
                })()}
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Trades</h3>
                <TradesList 
                  trades={(
                    selectedDate && 
                    entriesMap.get(format(selectedDate, 'yyyy-MM-dd'))?.trades
                  ) || []} 
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
} 