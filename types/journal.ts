export interface TradeEntry {
  id: string
  date: string // ISO date string
  symbol: string
  contract?: string
  direction: 'Long' | 'Short'
  entryPrice: number
  exitPrice: number
  quantity: number
  pnl: number
  fees?: number
  notes?: string
}

export interface DailyJournalEntry {
  date: string // ISO date string (YYYY-MM-DD)
  trades: TradeEntry[]
  totalPnl: number
  winningTrades: number
  losingTrades: number
  notes?: string
}

export interface TradingJournalData {
  entries: DailyJournalEntry[]
  lastUpdated: string
} 