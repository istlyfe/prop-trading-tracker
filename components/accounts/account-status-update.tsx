"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import { useAccounts } from "@/hooks/use-accounts"
import { cn } from "@/lib/utils"
import type { Account, AccountStatus } from "@/types/account"

// Form schema for status update
const formSchema = z.object({
  status: z.string({
    required_error: "Please select a status",
  }),
  date: z.date({
    required_error: "Please select a date",
  }),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface AccountStatusUpdateProps {
  account: Account
}

export function AccountStatusUpdate({ account }: AccountStatusUpdateProps) {
  const { toast } = useToast()
  const router = useRouter()
  const { updateAccount } = useAccounts()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Setup form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: account.status,
      date: new Date(),
      notes: "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    
    try {
      // Update account with new status
      updateAccount(account.id, {
        status: values.status as AccountStatus,
        statusNotes: values.notes, // This will be used to create the status history item
        statusDate: values.date.toISOString(), // Pass the selected date
      })
      
      toast({
        title: "Status updated",
        description: `Account status has been updated to ${values.status}.`,
      })
      
      // Force a hard refresh to ensure all components get updated data
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem updating the account status.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Status</CardTitle>
        <CardDescription>Change the current status of this account</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="evaluation">Evaluation</SelectItem>
                        <SelectItem value="funded">Funded</SelectItem>
                        <SelectItem value="blown">Blown</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs sm:text-sm">
                      The current status of this account
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Status Change Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal text-xs sm:text-sm",
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
                    <FormDescription className="text-xs sm:text-sm">
                      The date when this status change occurred
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional details about this status change"
                      className="resize-none min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs sm:text-sm">
                    Additional context about this status change
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between sm:justify-end gap-2">
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? "Updating..." : "Update Status"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
} 