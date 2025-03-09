"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAccounts } from "@/hooks/use-accounts"
import { useTransactions } from "@/hooks/use-transactions"
import type { Transaction } from "@/types/transaction"
import { cn } from "@/lib/utils"

const transactionFormSchema = z.object({
  accountId: z.string({
    required_error: "Please select an account",
  }),
  type: z.string({
    required_error: "Please select a transaction type",
  }),
  amount: z.string().min(1, "Amount is required"),
  date: z.date({
    required_error: "Transaction date is required",
  }),
  description: z.string().optional(),
  category: z.string().optional(),
})

type TransactionFormValues = z.infer<typeof transactionFormSchema>

interface TransactionFormProps {
  transaction?: Transaction
  defaultAccountId?: string
}

export function TransactionForm({ transaction, defaultAccountId }: TransactionFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const { accounts } = useAccounts()
  const { addTransaction, updateTransaction } = useTransactions()
  const [isLoading, setIsLoading] = useState(false)

  // Form default values
  const defaultValues: Partial<TransactionFormValues> = {
    accountId: defaultAccountId || "",
    type: "evaluationFee",
    amount: "",
    date: new Date(),
    description: "",
    category: "",
  }

  // If editing an existing transaction, use its values
  useEffect(() => {
    if (transaction) {
      form.reset({
        accountId: transaction.accountId,
        type: transaction.type,
        amount: transaction.amount.toString(),
        date: new Date(transaction.date),
        description: transaction.description || "",
        category: transaction.category || "",
      })
    }
  }, [transaction])

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues,
  })

  const onSubmit = async (data: TransactionFormValues) => {
    setIsLoading(true)

    try {
      if (transaction) {
        // Update existing transaction
        updateTransaction(transaction.id, {
          accountId: data.accountId,
          type: data.type as any,
          amount: parseFloat(data.amount),
          date: data.date.toISOString(),
          description: data.description,
          category: data.category,
        })
        
        toast({
          title: "Transaction updated",
          description: "Your transaction has been updated successfully.",
        })
      } else {
        // Add new transaction
        addTransaction({
          accountId: data.accountId,
          type: data.type as any,
          amount: parseFloat(data.amount),
          date: data.date.toISOString(),
          description: data.description,
          category: data.category,
        })
        
        toast({
          title: "Transaction added",
          description: "Your transaction has been added successfully.",
        })
      }

      // Navigate back based on where we came from
      if (defaultAccountId) {
        router.push(`/accounts/${defaultAccountId}`)
      } else {
        router.push("/transactions")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while saving the transaction.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{transaction ? "Edit Transaction" : "Add Transaction"}</CardTitle>
            <CardDescription>
              {transaction
                ? "Update the details of your transaction"
                : "Create a new transaction for your account"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!defaultAccountId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.length > 0 ? (
                        accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.firmName} {account.accountName ? `(${account.accountName})` : ""}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-accounts" disabled>
                          No accounts found. Please create an account first.
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The account this transaction belongs to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="evaluationFee">Evaluation Fee</SelectItem>
                        <SelectItem value="activationFee">Activation Fee</SelectItem>
                        <SelectItem value="payout">Payout</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The type of transaction
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="500" {...field} />
                    </FormControl>
                    <FormDescription>
                      The amount of the transaction
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      The date of the transaction
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Challenge Fee, Payout, etc." {...field} />
                    </FormControl>
                    <FormDescription>
                      Category to help organize transactions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="FTMO Challenge Fee, Monthly Payout, etc." {...field} />
                  </FormControl>
                  <FormDescription>
                    A brief description of the transaction
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (defaultAccountId) {
                  router.push(`/accounts/${defaultAccountId}`)
                } else {
                  router.push("/transactions")
                }
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : transaction ? "Update Transaction" : "Add Transaction"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
} 