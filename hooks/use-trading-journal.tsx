"use client"

import { useState, useEffect, createContext, useContext } from 'react'
import { useSession } from 'next-auth/react'
import { v4 as uuidv4 } from 'uuid'
import { parseCSV } from '@/lib/csv-parser'
import { DailyJournalEntry, TradingJournalData, TradeEntry } from '@/types/journal'
import { getSupabase } from '@/lib/supabase'

// Individual storage keys for each user
const getStorageKey = (userId: string | null | undefined) => {
  return userId 
    ? `prop-trading-journal-data-user-${userId}` 
    : 'prop-trading-journal-data-anonymous'
}

// Create a debug div to show current user info
const UserDebugger = () => {
  const { data: session } = useSession()
  const userId = session?.user?.id || 'not logged in'
  const email = session?.user?.email || 'no email'
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      backgroundColor: 'rgba(0,0,0,0.7)', 
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      User: {email}<br />
      ID: {userId}<br />
      Storage Key: {getStorageKey(userId as string)}
    </div>
  )
}

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
  const { data: session, status } = useSession()
  const [journalData, setJournalData] = useState<TradingJournalData>(defaultJournalData)
  const [isLoading, setIsLoading] = useState(true)
  const [loadedForUser, setLoadedForUser] = useState<string | null>(null)
  
  // Get the current user ID
  const userId = session?.user?.id || null
  
  // When user changes, reset everything and load new data
  useEffect(() => {
    console.log(`====== SESSION CHANGE DETECTED ======`)
    console.log(`Current session status: ${status}`)
    console.log(`Current user ID: ${userId || 'none'}`)
    console.log(`Previously loaded for user: ${loadedForUser || 'none'}`)
    
    // If this is a user change (not just initial loading)
    if (status !== 'loading') {
      if (userId !== loadedForUser) {
        console.log(`User changed from ${loadedForUser || 'none'} to ${userId || 'none'}, reloading data`)
        
        // Reset state and load new data
        setJournalData(defaultJournalData)
        loadUserData(userId)
      }
    }
  }, [session, status, userId, loadedForUser])
  
  // Function to load user data
  const loadUserData = async (currentUserId: string | null) => {
    console.log(`Loading data for user: ${currentUserId || 'anonymous'}`)
    setIsLoading(true)
    
    try {
      // If user is authenticated, try to load from Supabase
      if (currentUserId) {
        console.log(`Attempting to load from Supabase for user ${currentUserId}`)
        
        const supabase = getSupabase()
        const { data, error } = await supabase
          .from('trading_journal')
          .select('data')
          .eq('user_id', currentUserId)
          .single()
          
        if (error) {
          console.error('Error loading from Supabase:', error)
          // If error, fall back to user-specific localStorage
          loadFromLocalStorage(currentUserId)
        } else if (data?.data) {
          // If data exists in Supabase, use it
          try {
            const parsedData = typeof data.data === 'string' 
              ? JSON.parse(data.data) 
              : data.data
            
            console.log(`Successfully loaded data from Supabase for user ${currentUserId}`)
            console.log(`Data contains ${parsedData.entries?.length || 0} entries`)
            
            setJournalData(parsedData)
            setLoadedForUser(currentUserId)
          } catch (parseError) {
            console.error('Error parsing Supabase data:', parseError)
            setJournalData(defaultJournalData)
            setLoadedForUser(currentUserId)
          }
        } else {
          // If no data in Supabase, try user-specific localStorage
          console.log(`No data in Supabase for user ${currentUserId}, checking localStorage`)
          loadFromLocalStorage(currentUserId)
        }
      } else {
        // Not authenticated, use anonymous localStorage
        console.log('No authenticated user, using anonymous localStorage')
        loadFromLocalStorage(null)
      }
    } catch (error) {
      console.error('Error initializing journal data:', error)
      loadFromLocalStorage(currentUserId)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Function to load from localStorage
  const loadFromLocalStorage = (currentUserId: string | null) => {
    const storageKey = getStorageKey(currentUserId)
    console.log(`Loading from localStorage with key: ${storageKey}`)
    
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem(storageKey)
      
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData)
          console.log(`Successfully loaded from localStorage: ${parsedData.entries?.length || 0} entries`)
          setJournalData(parsedData)
          setLoadedForUser(currentUserId)
        } catch (error) {
          console.error('Error parsing stored journal data:', error)
          setJournalData(defaultJournalData)
          setLoadedForUser(currentUserId)
        }
      } else {
        // No data for this user, start with empty state
        console.log(`No data in localStorage for key ${storageKey}, using default empty state`)
        setJournalData(defaultJournalData)
        setLoadedForUser(currentUserId)
      }
    }
  }
  
  // Save data whenever it changes (and we know which user it belongs to)
  useEffect(() => {
    if (!isLoading && loadedForUser !== undefined) {
      const saveData = async () => {
        // Save to appropriate localStorage key
        if (typeof window !== 'undefined') {
          const storageKey = getStorageKey(loadedForUser)
          console.log(`Saving to localStorage with key: ${storageKey}`)
          localStorage.setItem(storageKey, JSON.stringify(journalData))
        }
        
        // If authenticated, also save to Supabase
        if (loadedForUser) {
          try {
            console.log(`Saving to Supabase for user ${loadedForUser}`)
            console.log(`Data contains ${journalData.entries?.length || 0} entries`)
            
            const supabase = getSupabase()
            const { error } = await supabase
              .from('trading_journal')
              .upsert({
                user_id: loadedForUser,
                data: journalData,
                last_updated: new Date().toISOString(),
              })
              
            if (error) {
              console.error('Error saving to Supabase:', error)
            } else {
              console.log('Successfully saved to Supabase')
            }
          } catch (error) {
            console.error('Exception saving to Supabase:', error)
          }
        }
      }
      
      saveData()
    }
  }, [journalData, isLoading, loadedForUser])

  // Import CSV data
  const importCSV = (csvContent: string) => {
    console.log(`Importing CSV data for user ${loadedForUser || 'anonymous'}`)
    
    try {
      const parsedData = parseCSV(csvContent)
      
      if (parsedData && parsedData.length > 0) {
        console.log(`Parsed ${parsedData.length} rows from CSV`)
        
        // Process the parsed data
        const updatedEntries = [...journalData.entries]
        let entriesUpdated = 0
        
        // Group trades by date
        parsedData.forEach((trade) => {
          const { date } = trade
          const existingEntryIndex = updatedEntries.findIndex(
            (entry) => entry.date === date
          )
          
          if (existingEntryIndex >= 0) {
            // Add trade to existing entry
            updatedEntries[existingEntryIndex].trades.push({
              ...trade,
              id: uuidv4(),
            })
            entriesUpdated++
          } else {
            // Create new entry
            updatedEntries.push({
              date,
              pnl: 0, // Will be calculated later
              trades: [{ ...trade, id: uuidv4() }],
            })
            entriesUpdated++
          }
        })
        
        // Sort entries by date (most recent first)
        updatedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        console.log(`Updated ${entriesUpdated} journal entries from CSV`)
        
        setJournalData({
          entries: updatedEntries,
          lastUpdated: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error('Error parsing CSV:', error)
    }
  }
  
  // Add manual entry
  const addManualEntry = (entry: DailyJournalEntry) => {
    console.log(`Adding manual entry for date ${entry.date} (user: ${loadedForUser || 'anonymous'})`)
    
    const existingEntryIndex = journalData.entries.findIndex(
      (e) => e.date === entry.date
    )
    
    if (existingEntryIndex >= 0) {
      // Update existing entry
      const updatedEntries = [...journalData.entries]
      updatedEntries[existingEntryIndex] = {
        ...updatedEntries[existingEntryIndex],
        ...entry,
        trades: [
          ...updatedEntries[existingEntryIndex].trades,
          ...entry.trades.map((trade) => ({ ...trade, id: uuidv4() })),
        ],
      }
      
      setJournalData({
        entries: updatedEntries,
        lastUpdated: new Date().toISOString(),
      })
    } else {
      // Add new entry
      const newEntries = [
        {
          ...entry,
          trades: entry.trades.map((trade) => ({ ...trade, id: uuidv4() })),
        },
        ...journalData.entries,
      ]
      
      // Sort entries by date (most recent first)
      newEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      setJournalData({
        entries: newEntries,
        lastUpdated: new Date().toISOString(),
      })
    }
  }
  
  // Update existing entry
  const updateEntry = (date: string, updatedEntry: Partial<DailyJournalEntry>) => {
    console.log(`Updating entry for date ${date} (user: ${loadedForUser || 'anonymous'})`)
    
    const entryIndex = journalData.entries.findIndex((entry) => entry.date === date)
    
    if (entryIndex >= 0) {
      const updatedEntries = [...journalData.entries]
      updatedEntries[entryIndex] = {
        ...updatedEntries[entryIndex],
        ...updatedEntry,
      }
      
      setJournalData({
        entries: updatedEntries,
        lastUpdated: new Date().toISOString(),
      })
    }
  }
  
  // Delete entry
  const deleteEntry = (date: string) => {
    console.log(`Deleting entry for date ${date} (user: ${loadedForUser || 'anonymous'})`)
    
    const updatedEntries = journalData.entries.filter(
      (entry) => entry.date !== date
    )
    
    setJournalData({
      entries: updatedEntries,
      lastUpdated: new Date().toISOString(),
    })
  }
  
  // Add trade to a day
  const addTradeToDay = (date: string, trade: Omit<TradeEntry, 'id'>) => {
    console.log(`Adding trade to day ${date} (user: ${loadedForUser || 'anonymous'})`)
    
    const entryIndex = journalData.entries.findIndex(
      (entry) => entry.date === date
    )
    
    if (entryIndex >= 0) {
      // Add to existing day
      const updatedEntries = [...journalData.entries]
      updatedEntries[entryIndex] = {
        ...updatedEntries[entryIndex],
        trades: [
          ...updatedEntries[entryIndex].trades,
          { ...trade, id: uuidv4() },
        ],
      }
      
      setJournalData({
        entries: updatedEntries,
        lastUpdated: new Date().toISOString(),
      })
    } else {
      // Create new day
      const newEntry: DailyJournalEntry = {
        date,
        pnl: 0, // Will be calculated later
        trades: [{ ...trade, id: uuidv4() }],
      }
      
      const newEntries = [...journalData.entries, newEntry]
      
      // Sort entries by date (most recent first)
      newEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      setJournalData({
        entries: newEntries,
        lastUpdated: new Date().toISOString(),
      })
    }
  }
  
  // Delete trade from a day
  const deleteTradeFromDay = (date: string, tradeId: string) => {
    console.log(`Deleting trade ${tradeId} from day ${date} (user: ${loadedForUser || 'anonymous'})`)
    
    const entryIndex = journalData.entries.findIndex(
      (entry) => entry.date === date
    )
    
    if (entryIndex >= 0) {
      const updatedEntries = [...journalData.entries]
      updatedEntries[entryIndex] = {
        ...updatedEntries[entryIndex],
        trades: updatedEntries[entryIndex].trades.filter(
          (trade) => trade.id !== tradeId
        ),
      }
      
      setJournalData({
        entries: updatedEntries,
        lastUpdated: new Date().toISOString(),
      })
    }
  }

  const clearAllData = async () => {
    // Clear local state
    setJournalData(defaultJournalData)
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      console.log(`Clearing localStorage for user ${loadedForUser || 'anonymous'}`)
      localStorage.removeItem(getStorageKey(loadedForUser))
    }
    
    // If authenticated, also clear from Supabase
    if (loadedForUser) {
      try {
        console.log(`Clearing Supabase data for user ${loadedForUser}`)
        const supabase = getSupabase()
        const { error } = await supabase
          .from('trading_journal')
          .update({
            data: defaultJournalData,
            last_updated: new Date().toISOString(),
          })
          .eq('user_id', loadedForUser)
          
        if (error) {
          console.error('Error clearing data in Supabase:', error)
        } else {
          console.log('Successfully cleared Supabase data')
        }
      } catch (error) {
        console.error('Exception clearing data in Supabase:', error)
      }
    }
  }

  // Include this if you need to see debug info
  const shouldShowDebugger = process.env.NODE_ENV === 'development'

  return (
    <TradingJournalContext.Provider
      value={{
        journalData,
        isLoading,
        importCSV,
        addManualEntry,
        updateEntry,
        deleteEntry,
        addTradeToDay,
        deleteTradeFromDay,
        clearAllData,
      }}
    >
      {children}
      {shouldShowDebugger && <UserDebugger />}
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