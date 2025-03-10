"use client"

import { useState, useEffect, createContext, useContext } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { parseCSV } from '@/lib/csv-parser'
import { DailyJournalEntry, TradingJournalData, TradeEntry } from '@/types/journal'

const STORAGE_KEY = 'prop-trading-journal-data'

interface TradingJournalContextValue {
  journalData: TradingJournalData
  isLoading: boolean
  importCSV: (csvContent: string) => void
  addManualEntry: (entry: DailyJournalEntry) => void
  updateEntry: (date: string, updatedEntry: Partial<DailyJournalEntry>) => void
  deleteEntry: (date: string) => void
  addTradeToDay: (date: string, trade: Omit<TradeEntry, 'id'>) => void
  deleteTradeFromDay: (date: string, tradeId: string) => void
  clearAllData: () => void
}

const defaultJournalData: TradingJournalData = {
  entries: [],
  lastUpdated: new Date().toISOString()
}

const TradingJournalContext = createContext<TradingJournalContextValue | null>(null)

export function TradingJournalProvider({ children }: { children: React.ReactNode }) {
  const [journalData, setJournalData] = useState<TradingJournalData>(defaultJournalData)
  const [isLoading, setIsLoading] = useState(true)

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem(STORAGE_KEY)
      if (storedData) {
        try {
          setJournalData(JSON.parse(storedData))
        } catch (error) {
          console.error('Error parsing stored journal data:', error)
        }
      }
      setIsLoading(false)
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isLoading && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(journalData))
    }
  }, [journalData, isLoading])

  const importCSV = (csvContent: string) => {
    try {
      // Check if it's already a parsed JSON array of entries
      let parsedEntries: DailyJournalEntry[] = []
      
      try {
        // First try parsing as JSON (pre-parsed entries)
        const jsonData = JSON.parse(csvContent)
        if (Array.isArray(jsonData)) {
          parsedEntries = jsonData
        } else {
          // Use standard CSV parser
          parsedEntries = parseCSV(csvContent)
        }
      } catch (e) {
        // If JSON parsing fails, use standard CSV parser
        parsedEntries = parseCSV(csvContent)
      }
      
      // Merge with existing entries
      const existingEntries = [...journalData.entries]
      const existingDates = new Set(existingEntries.map(entry => entry.date))
      
      // Add new entries or update existing ones
      parsedEntries.forEach(newEntry => {
        if (existingDates.has(newEntry.date)) {
          // Update existing entry
          const existingIndex = existingEntries.findIndex(e => e.date === newEntry.date)
          const existingEntry = existingEntries[existingIndex]
          
          // Combine trades from both
          const existingTradeIds = new Set(existingEntry.trades.map(t => t.id))
          const combinedTrades = [
            ...existingEntry.trades,
            ...newEntry.trades.filter(t => !existingTradeIds.has(t.id))
          ]
          
          // Recalculate totals
          const totalPnl = combinedTrades.reduce((sum, trade) => sum + trade.pnl, 0)
          const winningTrades = combinedTrades.filter(trade => trade.pnl > 0).length
          const losingTrades = combinedTrades.filter(trade => trade.pnl < 0).length
          
          existingEntries[existingIndex] = {
            ...existingEntry,
            trades: combinedTrades,
            totalPnl,
            winningTrades,
            losingTrades
          }
        } else {
          // Add new entry
          existingEntries.push(newEntry)
          existingDates.add(newEntry.date)
        }
      })
      
      // Sort by date
      existingEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
      setJournalData({
        entries: existingEntries,
        lastUpdated: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error importing CSV:', error)
    }
  }

  const addManualEntry = (entry: DailyJournalEntry) => {
    const updatedEntries = [...journalData.entries]
    const existingIndex = updatedEntries.findIndex(e => e.date === entry.date)
    
    if (existingIndex >= 0) {
      // Update existing
      updatedEntries[existingIndex] = entry
    } else {
      // Add new
      updatedEntries.push(entry)
      // Sort by date
      updatedEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }
    
    setJournalData({
      entries: updatedEntries,
      lastUpdated: new Date().toISOString()
    })
  }

  const updateEntry = (date: string, updatedEntry: Partial<DailyJournalEntry>) => {
    const updatedEntries = [...journalData.entries]
    const existingIndex = updatedEntries.findIndex(e => e.date === date)
    
    if (existingIndex >= 0) {
      updatedEntries[existingIndex] = {
        ...updatedEntries[existingIndex],
        ...updatedEntry
      }
      
      setJournalData({
        entries: updatedEntries,
        lastUpdated: new Date().toISOString()
      })
    }
  }

  const deleteEntry = (date: string) => {
    setJournalData({
      entries: journalData.entries.filter(entry => entry.date !== date),
      lastUpdated: new Date().toISOString()
    })
  }

  const addTradeToDay = (date: string, trade: Omit<TradeEntry, 'id'>) => {
    const updatedEntries = [...journalData.entries]
    const existingIndex = updatedEntries.findIndex(e => e.date === date)
    
    const newTrade: TradeEntry = {
      ...trade,
      id: uuidv4()
    }
    
    if (existingIndex >= 0) {
      // Add to existing day
      const existingEntry = updatedEntries[existingIndex]
      const updatedTrades = [...existingEntry.trades, newTrade]
      
      // Recalculate totals
      const totalPnl = updatedTrades.reduce((sum, t) => sum + t.pnl, 0)
      const winningTrades = updatedTrades.filter(t => t.pnl > 0).length
      const losingTrades = updatedTrades.filter(t => t.pnl < 0).length
      
      updatedEntries[existingIndex] = {
        ...existingEntry,
        trades: updatedTrades,
        totalPnl,
        winningTrades,
        losingTrades
      }
    } else {
      // Create new day
      const newEntry: DailyJournalEntry = {
        date,
        trades: [newTrade],
        totalPnl: newTrade.pnl,
        winningTrades: newTrade.pnl > 0 ? 1 : 0,
        losingTrades: newTrade.pnl < 0 ? 1 : 0
      }
      
      updatedEntries.push(newEntry)
      // Sort by date
      updatedEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }
    
    setJournalData({
      entries: updatedEntries,
      lastUpdated: new Date().toISOString()
    })
  }

  const deleteTradeFromDay = (date: string, tradeId: string) => {
    const updatedEntries = [...journalData.entries]
    const existingIndex = updatedEntries.findIndex(e => e.date === date)
    
    if (existingIndex >= 0) {
      const existingEntry = updatedEntries[existingIndex]
      const updatedTrades = existingEntry.trades.filter(t => t.id !== tradeId)
      
      if (updatedTrades.length === 0) {
        // If no trades left, remove the entire day
        updatedEntries.splice(existingIndex, 1)
      } else {
        // Recalculate totals
        const totalPnl = updatedTrades.reduce((sum, t) => sum + t.pnl, 0)
        const winningTrades = updatedTrades.filter(t => t.pnl > 0).length
        const losingTrades = updatedTrades.filter(t => t.pnl < 0).length
        
        updatedEntries[existingIndex] = {
          ...existingEntry,
          trades: updatedTrades,
          totalPnl,
          winningTrades,
          losingTrades
        }
      }
      
      setJournalData({
        entries: updatedEntries,
        lastUpdated: new Date().toISOString()
      })
    }
  }

  const clearAllData = () => {
    setJournalData(defaultJournalData)
  }

  return (
    <TradingJournalContext.Provider value={{
      journalData,
      isLoading,
      importCSV,
      addManualEntry,
      updateEntry,
      deleteEntry,
      addTradeToDay,
      deleteTradeFromDay,
      clearAllData
    }}>
      {children}
    </TradingJournalContext.Provider>
  )
}

export function useTradingJournal() {
  const context = useContext(TradingJournalContext)
  if (context === null) {
    throw new Error('useTradingJournal must be used within a TradingJournalProvider')
  }
  return context
} 