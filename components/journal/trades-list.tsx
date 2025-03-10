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

interface TradesListProps {
  trades: TradeEntry[]
}

export function TradesList({ trades }: TradesListProps) {
  if (trades.length === 0) {
    return <p className="text-sm text-muted-foreground">No trades for this day.</p>
  }
  
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
            <TableHead className="text-right">P&L</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => (
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
              <TableCell className={`text-right font-medium ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(trade.pnl)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 