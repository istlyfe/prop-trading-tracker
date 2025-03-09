"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, Check, CreditCard, ClipboardCheck, PlusCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { useTransactions } from "@/hooks/use-transactions"
import { useAccounts } from "@/hooks/use-accounts"
import { formatCurrency } from "@/lib/utils"

export default function TransactionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { transactions, deleteTransaction } = useTransactions()
  const { getAccountById } = useAccounts()
  const [mounted, setMounted] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [transaction, setTransaction] = useState<any>(null)
  const [account, setAccount] = useState<any>(null)
  
  useEffect(() => {
    setMounted(true)
    // Find the transaction by id
    const tx = transactions.find(t => t.id === params.id)
    if (tx) {
      setTransaction(tx)
      const acc = getAccountById(tx.accountId)
      if (acc) setAccount(acc)
    }
  }, [params.id, transactions, getAccountById])
  
  if (!mounted || !transaction) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading transaction details...</p>
      </div>
    )
  }
  
  const handleDelete = () => {
    deleteTransaction(transaction.id)
    toast({
      title: "Transaction deleted",
      description: "The transaction has been deleted successfully.",
    })
    router.push("/transactions")
  }
  
  const transactionTypeLabels = {
    evaluationFee: "Evaluation Fee",
    activationFee: "Activation Fee",
    payout: "Payout",
  }
  
  const transactionIcons = {
    evaluationFee: <CreditCard className="h-6 w-6 text-red-500" />,
    activationFee: <ClipboardCheck className="h-6 w-6 text-orange-500" />,
    payout: <PlusCircle className="h-6 w-6 text-green-500" />,
  }
  
  const transactionColors = {
    evaluationFee: "bg-red-50 text-red-600 border-red-200",
    activationFee: "bg-orange-50 text-orange-600 border-orange-200",
    payout: "bg-green-50 text-green-600 border-green-200",
  }
  
  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push("/transactions")} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Transaction Details</h1>
      </div>
      
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <div className={`rounded-full p-4 ${transaction.type === 'evaluationFee' ? 'bg-red-50 dark:bg-red-950/20' : 
                    transaction.type === 'activationFee' ? 'bg-orange-50 dark:bg-orange-950/20' : 
                    'bg-green-50 dark:bg-green-950/20'}`}>
            {transactionIcons[transaction.type]}
          </div>
          <div>
            <Badge className={transactionColors[transaction.type]}>
              {transactionTypeLabels[transaction.type]}
            </Badge>
            <CardTitle className="mt-2">
              {transaction.type === 'payout' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Date</h3>
            <p>{format(new Date(transaction.date), "PPPP")}</p>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Account</h3>
            <p className="font-medium">{account?.firmName || "Unknown"}</p>
            {account && (
              <p className="text-sm text-muted-foreground mt-1">
                {account.accountSize} - {account.challenge}
              </p>
            )}
          </div>
          
          {transaction.description && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                <p>{transaction.description}</p>
              </div>
            </>
          )}
          
          {/* Additional details like category could be added here */}
        </CardContent>
        
        <CardFooter className="flex justify-between pt-2">
          <Button variant="outline" onClick={() => router.push(`/transactions/${transaction.id}/edit`)}>
            Edit Transaction
          </Button>
          
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-red-500 hover:text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Transaction</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this transaction? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
      
      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>Transaction ID: {transaction.id}</p>
      </div>
    </div>
  )
} 