"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { PlusCircle, CreditCard, ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useTransactions } from "@/hooks/use-transactions"
import { useAccounts } from "@/hooks/use-accounts"
import { formatCurrency } from "@/lib/utils"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import type { Transaction } from "@/types/transaction"

export function TransactionsList() {
  const { transactions } = useTransactions()
  const { getAccountById } = useAccounts()
  // Initialize with empty array to avoid hydration mismatch
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  // Add a mounted state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)
  
  // Transaction type display mapping
  const transactionTypeLabels = {
    evaluationFee: "Evaluation Fee",
    activationFee: "Activation Fee",
    payout: "Payout",
  }

  // Set up initial state after mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    setFilteredTransactions(transactions)
  }, [transactions])

  // Handle filter changes
  const handleFilterChange = (filters: any) => {
    if (!mounted) return
    
    let result = [...transactions]
    
    // Filter by type
    if (filters.type) {
      result = result.filter(tx => tx.type === filters.type)
    }
    
    // Filter by account
    if (filters.accountId) {
      result = result.filter(tx => tx.accountId === filters.accountId)
    }
    
    // Filter by date range
    if (filters.startDate) {
      const startDate = new Date(filters.startDate)
      result = result.filter(tx => new Date(tx.date) >= startDate)
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate)
      endDate.setHours(23, 59, 59) // End of day
      result = result.filter(tx => new Date(tx.date) <= endDate)
    }
    
    // Filter by amount range
    if (filters.minAmount && filters.minAmount !== "") {
      const minAmount = parseFloat(filters.minAmount)
      result = result.filter(tx => tx.amount >= minAmount)
    }
    
    if (filters.maxAmount && filters.maxAmount !== "") {
      const maxAmount = parseFloat(filters.maxAmount)
      result = result.filter(tx => tx.amount <= maxAmount)
    }
    
    setFilteredTransactions(result)
  }

  // Don't render anything until client-side
  if (!mounted) {
    return (
      <div className="grid gap-4">
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
        <Button asChild size="sm" className="gap-1">
          <Link href="/transactions/new">
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </Button>
      </div>
      
      {/* Transaction Filters */}
      <TransactionFilters onFilterChange={handleFilterChange} />
      
      {filteredTransactions.length > 0 ? (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => {
            const account = getAccountById(transaction.accountId)
            return (
              <Link key={transaction.id} href={`/transactions/${transaction.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-all duration-200">
                  <div className="flex flex-col sm:flex-row">
                    {/* Transaction icon column */}
                    <div className={`p-4 flex items-center justify-center
                      ${transaction.type === 'evaluationFee' ? 'bg-red-50 dark:bg-red-950/20' : 
                       transaction.type === 'activationFee' ? 'bg-orange-50 dark:bg-orange-950/20' : 
                       'bg-green-50 dark:bg-green-950/20'}`}>
                      <div className={`rounded-full p-3
                        ${transaction.type === 'evaluationFee' ? 'bg-red-100 dark:bg-red-900/30' : 
                         transaction.type === 'activationFee' ? 'bg-orange-100 dark:bg-orange-900/30' : 
                         'bg-green-100 dark:bg-green-900/30'}`}>
                        {transaction.type === 'evaluationFee' && <CreditCard className="h-6 w-6 text-red-500" />}
                        {transaction.type === 'activationFee' && <ClipboardCheck className="h-6 w-6 text-orange-500" />}
                        {transaction.type === 'payout' && <PlusCircle className="h-6 w-6 text-green-500" />}
                      </div>
                    </div>
                    
                    {/* Transaction details */}
                    <div className="flex-1 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="font-medium">
                            {transactionTypeLabels[transaction.type as keyof typeof transactionTypeLabels]}
                          </h3>
                          <p className="text-sm text-muted-foreground">{account ? account.firmName : "Unknown"}</p>
                        </div>
                        <div className={`text-lg font-bold ${transaction.type === 'evaluationFee' || transaction.type === 'activationFee' ? 'text-red-500' : 'text-green-500'}`}>
                          {transaction.type === 'payout' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                      </div>
                      
                      {transaction.description && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {transaction.description}
                        </p>
                      )}
                      
                      <div className="mt-3 pt-3 border-t flex justify-between items-center">
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(transaction.date), "EEEE, MMMM d, yyyy")}
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs">
                          View details
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <p className="text-sm text-muted-foreground">
              {transactions.length === 0
                ? "No transactions added yet. Click the button above to add your first transaction."
                : "No transactions match your filters. Try adjusting your search criteria."}
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

