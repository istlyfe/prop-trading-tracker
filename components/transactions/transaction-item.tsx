import type React from "react"
import Link from "next/link"
import { ArrowDownCircle, ClipboardCheck, CreditCard } from "lucide-react"
import type { Transaction, TransactionType } from "@/types/transaction"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useAccounts } from "@/hooks/use-accounts"

interface TransactionItemProps {
  transaction: Transaction
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const { getAccountById } = useAccounts()
  const account = getAccountById(transaction.accountId)

  const transactionIcons: Record<TransactionType, React.ReactNode> = {
    evaluationFee: <CreditCard className="h-4 w-4 text-red-500" />,
    activationFee: <ClipboardCheck className="h-4 w-4 text-orange-500" />,
    payout: <ArrowDownCircle className="h-4 w-4 text-green-500" />,
  }

  const transactionColors: Record<TransactionType, string> = {
    evaluationFee: "text-red-500",
    activationFee: "text-orange-500",
    payout: "text-green-500",
  }

  return (
    <Link href={`/transactions/${transaction.id}`}>
      <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          {transactionIcons[transaction.type]}
          <div>
            <p className="text-sm font-medium">
              {transaction.type === "evaluationFee" ? "Evaluation Fee" : 
               transaction.type === "activationFee" ? "Activation Fee" : "Payout"}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatDate(transaction.date)}</span>
              <span>•</span>
              <span className="font-medium truncate max-w-[150px]">
                {account ? account.firmName : "Unknown account"}
              </span>
            </div>
          </div>
        </div>
        <div className={`text-sm font-medium ${transactionColors[transaction.type]}`}>
          {transaction.type === "payout"
            ? "+" + formatCurrency(transaction.amount)
            : "-" + formatCurrency(transaction.amount)}
        </div>
      </div>
    </Link>
  )
}

