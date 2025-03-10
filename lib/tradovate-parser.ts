import { v4 as uuidv4 } from 'uuid'
import { TradeEntry, DailyJournalEntry } from '@/types/journal'

interface TradovateOrder {
  orderId: string
  account: string
  buySell: string
  contract: string
  product: string
  productDesc: string
  avgPrice: number
  filledQty: number
  fillTime: string
  status: string
  timestamp: string
  date: string
  quantity: number
}

// Contract specification multipliers for accurate P&L calculations
const CONTRACT_MULTIPLIERS: Record<string, number> = {
  // Stock index futures
  'NQ': 20,      // NASDAQ-100 E-mini ($20 per point)
  'ES': 50,      // S&P 500 E-mini ($50 per point)
  'MES': 5,      // Micro E-mini S&P 500 ($5 per point)
  'MNQ': 2,      // Micro E-mini NASDAQ ($2 per point)
  'YM': 5,       // Dow E-mini ($5 per point)
  'RTY': 50,     // Russell 2000 E-mini ($50 per point)
  
  // Commodities
  'CL': 1000,    // Crude Oil ($1000 per $1)
  'GC': 100,     // Gold ($100 per $1)
  'SI': 5000,    // Silver ($5000 per $1)
  'ZC': 50,      // Corn ($50 per cent)
  'ZS': 50,      // Soybeans ($50 per cent)
  'ZW': 50,      // Wheat ($50 per cent)
  
  // Default multiplier
  'DEFAULT': 1,  // Will be used for any contract not explicitly listed
}

export function parseTradovateCSV(csvContent: string): DailyJournalEntry[] {
  const lines = csvContent.split('\n')
  
  // Skip header
  const dataLines = lines.slice(1).filter(line => line.trim() !== '')
  
  // Parse orders
  const orders: TradovateOrder[] = dataLines.map(line => {
    const columns = line.split(',').map(col => col.trim())
    
    return {
      orderId: columns[0] || '',
      account: columns[1] || '',
      buySell: columns[3] || '',
      contract: columns[4] || '',
      product: columns[5] || '',
      productDesc: columns[6] || '',
      avgPrice: parseFloat(columns[7] || '0'),
      filledQty: parseFloat(columns[8] || '0'),
      fillTime: columns[9] || '',
      status: columns[11] || '',
      timestamp: columns[17] || '',
      date: columns[18] || '',
      quantity: parseFloat(columns[19] || '0')
    }
  })
  
  // Filter for filled orders only
  const filledOrders = orders.filter(order => 
    order.status.includes('Filled') && 
    order.filledQty > 0 &&
    order.avgPrice > 0
  )
  
  // Group by contract
  const ordersByContract: Record<string, TradovateOrder[]> = {}
  
  filledOrders.forEach(order => {
    if (!ordersByContract[order.contract]) {
      ordersByContract[order.contract] = []
    }
    ordersByContract[order.contract].push(order)
  })
  
  // Create trades by matching buy/sell pairs
  const trades: TradeEntry[] = []
  
  Object.entries(ordersByContract).forEach(([contract, contractOrders]) => {
    // Sort by timestamp
    contractOrders.sort((a, b) => 
      new Date(a.fillTime).getTime() - new Date(b.fillTime).getTime()
    )
    
    // Get the base product (like ES, NQ) from the contract (like ESH4, NQM4)
    const baseProduct = contractOrders[0].product || contract.slice(0, 2)
    
    // Get multiplier for this contract type
    const multiplier = CONTRACT_MULTIPLIERS[baseProduct] || CONTRACT_MULTIPLIERS.DEFAULT
    
    // Process buy/sell pairs
    for (let i = 0; i < contractOrders.length - 1; i++) {
      const orderA = contractOrders[i]
      const orderB = contractOrders[i + 1]
      
      // Check if they form a complete trade (buy followed by sell or sell followed by buy)
      if (
        (orderA.buySell.includes('Buy') && orderB.buySell.includes('Sell')) ||
        (orderA.buySell.includes('Sell') && orderB.buySell.includes('Buy'))
      ) {
        // Determine entry and exit
        const isBuyFirst = orderA.buySell.includes('Buy')
        
        const entryOrder = isBuyFirst ? orderA : orderB
        const exitOrder = isBuyFirst ? orderB : orderA
        
        // Calculate price difference in points
        const priceDifference = isBuyFirst
          ? exitOrder.avgPrice - entryOrder.avgPrice
          : entryOrder.avgPrice - exitOrder.avgPrice
        
        // Calculate P&L with proper contract multiplier
        const pnl = priceDifference * multiplier * Math.min(entryOrder.filledQty, exitOrder.filledQty)
        
        // Extract date from fill time (MM/DD/YYYY HH:MM:SS format)
        const dateParts = entryOrder.fillTime.split(' ')[0].split('/')
        const isoDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`
        
        // Create trade entry
        trades.push({
          id: uuidv4(),
          date: isoDate + 'T' + entryOrder.fillTime.split(' ')[1], // Combine date and time
          symbol: entryOrder.product,
          contract: entryOrder.contract,
          direction: isBuyFirst ? 'Long' : 'Short',
          entryPrice: entryOrder.avgPrice,
          exitPrice: exitOrder.avgPrice,
          quantity: Math.min(entryOrder.filledQty, exitOrder.filledQty),
          pnl: Number(pnl.toFixed(2)),
          notes: `${entryOrder.productDesc} ${isBuyFirst ? 'Long' : 'Short'} - Price diff: ${Math.abs(priceDifference).toFixed(2)} points`
        })
        
        // Skip the next order since we used it in this pair
        i++
      }
    }
  })
  
  // Group trades by day
  const tradesByDay: Record<string, TradeEntry[]> = {}
  
  trades.forEach(trade => {
    const dateStr = trade.date.split('T')[0] // Get YYYY-MM-DD part
    if (!tradesByDay[dateStr]) {
      tradesByDay[dateStr] = []
    }
    tradesByDay[dateStr].push(trade)
  })
  
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