"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useTransactions } from "@/hooks/use-transactions"
import { formatCurrency } from "@/lib/utils"
import type { Account } from "@/types/account"
import type { Transaction } from "@/types/transaction"

interface AccountTransactionsProps {
  account: Account
}

export function AccountTransactions({ account }: AccountTransactionsProps) {
  const { getTransactionsByAccountId, deleteTransaction } = useTransactions()
  const transactions = getTransactionsByAccountId(account.id)

  const transactionTypeLabels = {
    evaluationFee: "Evaluation Fee",
    activationFee: "Activation Fee",
    payout: "Payout",
  }

  // Calculate total fees and payouts
  const totalCost = transactions
    .filter(tx => tx.type === "evaluationFee" || tx.type === "activationFee")
    .reduce((sum, tx) => sum + tx.amount, 0)

  const totalEarnings = transactions
    .filter(tx => tx.type === "payout")
    .reduce((sum, tx) => sum + tx.amount, 0)

  const netResult = totalEarnings - totalCost

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            Manage costs and earnings for this account
          </CardDescription>
        </div>
        <Button asChild size="sm">
          <Link href={`/accounts/${account.id}/transactions/new`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Transaction
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card>
            <CardHeader className="p-3 pb-0">
              <CardDescription>Total Costs</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-xl font-semibold text-red-500">
                {formatCurrency(totalCost)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 pb-0">
              <CardDescription>Total Earnings</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-xl font-semibold text-green-500">
                {formatCurrency(totalEarnings)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-3 pb-0">
              <CardDescription>Net Result</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className={`text-xl font-semibold ${netResult >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(netResult)}
              </p>
            </CardContent>
          </Card>
        </div>

        {transactions.length > 0 ? (
          <div className="rounded-md border">
            <div className="grid grid-cols-5 border-b px-4 py-2 font-medium">
              <div>Date</div>
              <div>Type</div>
              <div>Description</div>
              <div className="text-right">Amount</div>
              <div className="text-right">Actions</div>
            </div>
            <div className="divide-y">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="grid grid-cols-5 px-4 py-3">
                  <div>{format(new Date(transaction.date), "MMM d, yyyy")}</div>
                  <div>
                    {transactionTypeLabels[transaction.type as keyof typeof transactionTypeLabels]}
                  </div>
                  <div className="truncate">{transaction.description || "-"}</div>
                  <div className={`text-right ${transaction.type === 'evaluationFee' || transaction.type === 'activationFee' ? 'text-red-500' : 'text-green-500'}`}>
                    {formatCurrency(transaction.amount)}
                  </div>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/accounts/${account.id}/transactions/${transaction.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the transaction.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteTransaction(transaction.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-[150px] items-center justify-center rounded-md border border-dashed">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">
                No transactions for this account yet. Click the button above to add your first transaction.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

