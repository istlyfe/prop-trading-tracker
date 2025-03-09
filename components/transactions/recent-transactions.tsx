"use client"

import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransactions } from "@/hooks/use-transactions"
import { TransactionItem } from "@/components/transactions/transaction-item"

interface RecentTransactionsProps {
  className?: string
}

export function RecentTransactions({ className }: RecentTransactionsProps) {
  const { transactions } = useTransactions()

  // Sort by date descending and take the 5 most recent
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-1">
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>You have {transactions.length} total transactions</CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="/transactions/new">
            <PlusCircle className="h-4 w-4" />
            Add
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => <TransactionItem key={transaction.id} transaction={transaction} />)
        ) : (
          <div className="flex h-[120px] items-center justify-center rounded-md border border-dashed">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">
                No transactions recorded yet. Click the button above to add your first transaction.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      {transactions.length > 5 && (
        <CardFooter>
          <Button asChild variant="ghost" className="w-full" size="sm">
            <Link href="/transactions">View all transactions</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

