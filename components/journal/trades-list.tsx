"use client"

import { ArrowDown, ArrowUp } from "lucide-react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { TradeEntry } from "@/types/journal"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Define tick values and point multipliers for common futures contracts
const TICK_VALUES: Record<string, { tickValue: number, pointValue: number, ticksPerPoint: number }> = {
  'NQ': { tickValue: 5, pointValue: 20, ticksPerPoint: 4 },     // NASDAQ-100 E-mini
  'ES': { tickValue: 12.5, pointValue: 50, ticksPerPoint: 4 },  // S&P 500 E-mini
  'MES': { tickValue: 1.25, pointValue: 5, ticksPerPoint: 4 },  // Micro E-mini S&P 500
  'MNQ': { tickValue: 0.5, pointValue: 2, ticksPerPoint: 4 },   // Micro E-mini NASDAQ
  'CL': { tickValue: 10, pointValue: 1000, ticksPerPoint: 100 }, // Crude Oil
  'GC': { tickValue: 10, pointValue: 100, ticksPerPoint: 10 },  // Gold
}

interface TradesListProps {
  trades: TradeEntry[]
}

export function TradesList({ trades }: TradesListProps) {
  if (trades.length === 0) {
    return <p className="text-sm text-muted-foreground">No trades for this day.</p>
  }

  const calculateTicksAndPoints = (trade: TradeEntry) => {
    // Get symbol (ES, NQ, etc.)
    const symbol = trade.symbol;
    
    if (!TICK_VALUES[symbol]) {
      return null;
    }
    
    const { tickValue, pointValue, ticksPerPoint } = TICK_VALUES[symbol];
    
    // Calculate price difference
    const priceDiff = trade.direction === 'Long' 
      ? trade.exitPrice - trade.entryPrice 
      : trade.entryPrice - trade.exitPrice;
    
    // Calculate ticks
    // For most futures, 1 tick = 0.25 points
    const ticks = priceDiff * ticksPerPoint;
    
    // Calculate P&L per tick
    const plPerTick = trade.pnl / ticks;
    
    return {
      priceDiff,
      points: priceDiff.toFixed(2),
      ticks: Math.round(ticks),
      tickValue,
      pointValue
    };
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead>Entry</TableHead>
            <TableHead>Exit</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead className="text-right">Points</TableHead>
            <TableHead className="text-right">P&L</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => {
            const tickInfo = calculateTicksAndPoints(trade);
            
            return (
              <TableRow key={trade.id}>
                <TableCell className="font-medium">
                  {format(new Date(trade.date), 'HH:mm')}
                </TableCell>
                <TableCell>
                  {trade.contract || trade.symbol}
                </TableCell>
                <TableCell>
                  <span className={`flex items-center ${trade.direction === 'Long' ? 'text-green-600' : 'text-red-600'}`}>
                    {trade.direction === 'Long' ? (
                      <ArrowUp className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowDown className="mr-1 h-4 w-4" />
                    )}
                    {trade.direction}
                  </span>
                </TableCell>
                <TableCell>{trade.entryPrice.toFixed(2)}</TableCell>
                <TableCell>{trade.exitPrice.toFixed(2)}</TableCell>
                <TableCell>{trade.quantity}</TableCell>
                <TableCell className="text-right">
                  {tickInfo ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help underline decoration-dotted">
                            {tickInfo.points}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <div className="text-xs space-y-1">
                            <p>{tickInfo.ticks} ticks</p>
                            <p>${tickInfo.tickValue}/tick</p>
                            <p>${tickInfo.pointValue}/point</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span>-</span>
                  )}
                </TableCell>
                <TableCell className={`text-right font-medium ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(trade.pnl)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  )
} 