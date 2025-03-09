export type TransactionType = "evaluationFee" | "activationFee" | "payout"

export interface Transaction {
  id: string
  accountId: string
  type: TransactionType
  amount: number
  date: string
  description?: string
  category?: string
}

