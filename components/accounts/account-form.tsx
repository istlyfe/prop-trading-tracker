"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Plus } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAccounts } from "@/hooks/use-accounts"
import { useTransactions } from "@/hooks/use-transactions"
import { cn } from "@/lib/utils"

const accountFormSchema = z.object({
  firmName: z.string().min(1, "Firm name is required"),
  accountName: z.string().optional(),
  accountSize: z.string().min(1, "Account size is required"),
  type: z.string().min(1, "Account type is required"),
  status: z.string().min(1, "Account status is required"),
  notes: z.string().optional(),
})

const transactionFormSchema = z.object({
  transactionType: z.string().min(1, "Transaction type is required"),
  transactionAmount: z.string().min(1, "Amount is required"),
  transactionDate: z.date({
    required_error: "Transaction date is required",
  }),
  transactionDescription: z.string().optional(),
})

type AccountFormValues = z.infer<typeof accountFormSchema>
type TransactionFormValues = z.infer<typeof transactionFormSchema>

export function AccountForm() {
  const { toast } = useToast()
  const router = useRouter()
  const { addAccount } = useAccounts()
  const { addTransaction } = useTransactions()
  const [addingTransaction, setAddingTransaction] = useState(false)

  // Account form
  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      firmName: "",
      accountName: "",
      accountSize: "",
      type: "Evaluation",
      status: "evaluation",
      notes: "",
    },
  })

  // Transaction form
  const transactionForm = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      transactionType: "evaluationFee",
      transactionAmount: "",
      transactionDate: new Date(),
      transactionDescription: "",
    },
  })

  function onSubmit(data: AccountFormValues) {
    try {
      // Add the account
      const newAccount = addAccount({
        firmName: data.firmName,
        accountName: data.accountName || "",
        accountSize: parseFloat(data.accountSize),
        type: data.type,
        status: data.status as any,
        notes: data.notes,
      });

      // If user is adding a transaction, add it
      if (addingTransaction) {
        const transactionData = transactionForm.getValues();
        
        addTransaction({
          accountId: newAccount.id,
          type: transactionData.transactionType as any,
          amount: parseFloat(transactionData.transactionAmount),
          date: transactionData.transactionDate.toISOString(),
          description: transactionData.transactionDescription || 
            `${data.type} fee for ${data.firmName}${data.accountName ? ` (${data.accountName})` : ''}`,
        });
      }

      toast({
        title: "Account added",
        description: "Your account has been created successfully.",
      })

      router.push("/accounts")
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while adding the account.",
        variant: "destructive",
      })
      console.error(error)
    }
  }

  return (
    <Form {...accountForm}>
      <form onSubmit={accountForm.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>
              Add a new prop trading account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={accountForm.control}
              name="firmName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Firm Name</FormLabel>
                  <FormControl>
                    <Input placeholder="FTMO, MyForexFunds, etc." {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of the prop trading firm
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={accountForm.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Account identifier or nickname" {...field} />
                  </FormControl>
                  <FormDescription>
                    A name to identify this specific account
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={accountForm.control}
                name="accountSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Size</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="100000" {...field} />
                    </FormControl>
                    <FormDescription>
                      Size of the account in USD
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={accountForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Evaluation">Evaluation</SelectItem>
                        <SelectItem value="Funded">Funded</SelectItem>
                        <SelectItem value="Instant Funded">Instant Funded</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>The type of account</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={accountForm.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="evaluation">Evaluation</SelectItem>
                      <SelectItem value="funded">Funded</SelectItem>
                      <SelectItem value="blown">Blown</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Current status of the account</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={accountForm.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes about this account"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Transaction Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center justify-between">
                <span>Account Cost</span>
                <Button 
                  type="button" 
                  variant={addingTransaction ? "default" : "outline"}
                  onClick={() => setAddingTransaction(!addingTransaction)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {addingTransaction ? "Cancel Transaction" : "Add Transaction"}
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Add the initial cost for this account (optional)
            </CardDescription>
          </CardHeader>
          
          {addingTransaction && (
            <Form {...transactionForm}>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={transactionForm.control}
                    name="transactionType"
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={transactionForm.control}
                    name="transactionAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="500" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={transactionForm.control}
                    name="transactionDate"
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={transactionForm.control}
                    name="transactionDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Challenge fee, subscription, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Form>
          )}

          <CardFooter className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/accounts")}>
              Cancel
            </Button>
            <Button type="submit">Add Account</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
} 