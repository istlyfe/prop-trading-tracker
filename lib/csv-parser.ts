import { v4 as uuidv4 } from 'uuid'
import { TradeEntry, DailyJournalEntry } from '@/types/journal'

export interface CSVParseOptions {
  hasHeader?: boolean
  dateFormat?: string
  dateColumn?: number
  symbolColumn?: number
  directionColumn?: number
  entryPriceColumn?: number
  exitPriceColumn?: number
  quantityColumn?: number
  pnlColumn?: number
  feesColumn?: number
  notesColumn?: number
  contractColumn?: number
}

const defaultOptions: CSVParseOptions = {
  hasHeader: true,
  dateColumn: 0,
  symbolColumn: 1,
  contractColumn: 2,
  directionColumn: 3,
  entryPriceColumn: 4,
  exitPriceColumn: 5,
  quantityColumn: 6,
  pnlColumn: 7,
  feesColumn: 8,
  notesColumn: 9,
}

export function parseCSV(csvContent: string, options: CSVParseOptions = {}): DailyJournalEntry[] {
  const mergedOptions = { ...defaultOptions, ...options }
  const lines = csvContent.split('\n')
  const trades: TradeEntry[] = []
  
  // Skip header if specified
  const startIndex = mergedOptions.hasHeader ? 1 : 0
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    const columns = line.split(',').map(col => col.trim())
    
    // Skip if we don't have enough columns
    if (columns.length < 8) continue
    
    const dateCol = mergedOptions.dateColumn !== undefined ? columns[mergedOptions.dateColumn] : ''
    const symbolCol = mergedOptions.symbolColumn !== undefined ? columns[mergedOptions.symbolColumn] : ''
    const contractCol = mergedOptions.contractColumn !== undefined ? columns[mergedOptions.contractColumn] : ''
    const directionCol = mergedOptions.directionColumn !== undefined ? columns[mergedOptions.directionColumn] : ''
    const entryPriceCol = mergedOptions.entryPriceColumn !== undefined ? columns[mergedOptions.entryPriceColumn] : ''
    const exitPriceCol = mergedOptions.exitPriceColumn !== undefined ? columns[mergedOptions.exitPriceColumn] : ''
    const quantityCol = mergedOptions.quantityColumn !== undefined ? columns[mergedOptions.quantityColumn] : ''
    const pnlCol = mergedOptions.pnlColumn !== undefined ? columns[mergedOptions.pnlColumn] : ''
    const feesCol = mergedOptions.feesColumn !== undefined ? columns[mergedOptions.feesColumn] : ''
    const notesCol = mergedOptions.notesColumn !== undefined ? columns[mergedOptions.notesColumn] : ''
    
    // Parse values
    const date = new Date(dateCol)
    if (isNaN(date.getTime())) continue // Skip invalid dates
    
    const entryPrice = parseFloat(entryPriceCol)
    const exitPrice = parseFloat(exitPriceCol)
    const quantity = parseFloat(quantityCol)
    
    // Handle PnL column or calculate it
    let pnl: number
    if (pnlCol && !isNaN(parseFloat(pnlCol))) {
      pnl = parseFloat(pnlCol)
    } else {
      // Calculate PnL based on direction, prices, and quantity
      const direction = directionCol.toLowerCase()
      if (direction.includes('long') || direction === 'buy') {
        pnl = (exitPrice - entryPrice) * quantity
      } else if (direction.includes('short') || direction === 'sell') {
        pnl = (entryPrice - exitPrice) * quantity
      } else {
        continue // Skip rows with invalid direction
      }
    }
    
    // Standardize direction
    let direction: 'Long' | 'Short'
    if (directionCol.toLowerCase().includes('long') || directionCol.toLowerCase() === 'buy') {
      direction = 'Long'
    } else {
      direction = 'Short'
    }
    
    const fees = feesCol ? parseFloat(feesCol) : 0
    
    trades.push({
      id: uuidv4(),
      date: date.toISOString(),
      symbol: symbolCol,
      contract: contractCol || undefined,
      direction,
      entryPrice,
      exitPrice,
      quantity,
      pnl,
      fees: isNaN(fees) ? 0 : fees,
      notes: notesCol || undefined
    })
  }
  
  // Group trades by day
  const tradesByDay = trades.reduce<Record<string, TradeEntry[]>>((acc, trade) => {
    const dateStr = trade.date.split('T')[0] // Get YYYY-MM-DD part
    if (!acc[dateStr]) {
      acc[dateStr] = []
    }
    acc[dateStr].push(trade)
    return acc
  }, {})
  
  // Create daily entries
  const dailyEntries: DailyJournalEntry[] = Object.entries(tradesByDay).map(([date, dayTrades]) => {
    const totalPnl = dayTrades.reduce((sum, trade) => sum + trade.pnl, 0)
    const winningTrades = dayTrades.filter(trade => trade.pnl > 0).length
    const losingTrades = dayTrades.filter(trade => trade.pnl < 0).length
    
    return {
      date,
      trades: dayTrades,
      totalPnl,
      winningTrades,
      losingTrades
    }
  })
  
  // Sort by date
  dailyEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  return dailyEntries
} 