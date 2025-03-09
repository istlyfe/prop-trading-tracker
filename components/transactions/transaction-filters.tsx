"use client"

import { useState } from "react"
import { CalendarIcon, FilterIcon, X } from "lucide-react"
import { format, subDays } from "date-fns"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAccounts } from "@/hooks/use-accounts"
import type { Account } from "@/types/account"

// Schema for filter form
const filterSchema = z.object({
  type: z.string().optional(),
  accountId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  minAmount: z.string().optional(),
  maxAmount: z.string().optional(),
})

type FilterValues = z.infer<typeof filterSchema>

// Props for the component
export interface TransactionFilterProps {
  onFilterChange: (filters: FilterValues) => void
  className?: string
}

export function TransactionFilters({ onFilterChange, className }: TransactionFilterProps) {
  const { accounts } = useAccounts()
  const [filtersApplied, setFiltersApplied] = useState(false)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Setup form with default values
  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      type: "all",
      accountId: "all",
      startDate: undefined,
      endDate: undefined,
      minAmount: undefined,
      maxAmount: undefined,
    },
  })

  // Apply filters
  const applyFilters = (values: FilterValues) => {
    // Create a new filter object from form values, excluding undefined or "all" values
    const newFilters: Partial<FilterValues> = {}
    
    // Apply specific type if not "all"
    if (values.type && values.type !== "all") {
      newFilters.type = values.type
    }
    
    // Apply specific accountId if not "all"
    if (values.accountId && values.accountId !== "all") {
      newFilters.accountId = values.accountId
    }
    
    // Add other filters if they have values
    if (values.startDate) newFilters.startDate = values.startDate
    if (values.endDate) newFilters.endDate = values.endDate
    if (values.minAmount !== undefined) newFilters.minAmount = values.minAmount
    if (values.maxAmount !== undefined) newFilters.maxAmount = values.maxAmount
    
    // Pass the new filters to the parent
    onFilterChange(newFilters)
    setFiltersApplied(Object.keys(newFilters).length > 0)
    
    // Close mobile filter sheet if open
    if (mobileFilterOpen) {
      setMobileFilterOpen(false)
    }
  }

  // Reset filters
  const resetFilters = () => {
    form.reset({
      type: "all",
      accountId: "all",
      startDate: undefined,
      endDate: undefined,
      minAmount: undefined,
      maxAmount: undefined,
    })
    onFilterChange({})
    setFiltersApplied(false)
  }

  // Generate account options for the select
  const accountOptions = accounts.map((account: Account) => ({
    label: `${account.firmName}${account.accountName ? ` (${account.accountName})` : ''}`,
    value: account.id,
  }))

  // Filter form content that's used in both desktop and mobile views
  const filterFormContent = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="evaluationFee">Evaluation Fee</SelectItem>
                  <SelectItem value="activationFee">Activation Fee</SelectItem>
                  <SelectItem value="payout">Payout</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="accountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="All accounts" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">All accounts</SelectItem>
                  {accountOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>From Date</FormLabel>
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
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>To Date</FormLabel>
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
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="minAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="maxAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Any"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="flex justify-between mt-6">
        <Button 
          type="button" 
          variant="destructive"
          onClick={resetFilters}
          disabled={!filtersApplied}
        >
          Reset
        </Button>
        <Button type="button" onClick={() => applyFilters(form.getValues())}>
          Apply Filters
        </Button>
      </div>
    </div>
  )

  // Preset date filters for quick selection
  const applyDatePreset = (days: number) => {
    const endDate = new Date()
    const startDate = subDays(new Date(), days)
    
    form.setValue("startDate", startDate)
    form.setValue("endDate", endDate)
    
    applyFilters({
      ...form.getValues(),
      startDate,
      endDate
    })
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyDatePreset(7)}
          >
            Last 7 days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyDatePreset(30)}
          >
            Last 30 days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyDatePreset(90)}
          >
            Last 90 days
          </Button>
        </div>
        
        {/* Mobile filter button */}
        <div className="md:hidden">
          <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex gap-2 items-center">
                <FilterIcon className="h-4 w-4" />
                Filters {filtersApplied && <span className="badge size-2 bg-primary rounded-full"></span>}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-4/5 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filter Transactions</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <Form {...form}>
                  {filterFormContent}
                </Form>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Reset filters button - shown only when filters are applied */}
        {filtersApplied && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" /> Clear Filters
          </Button>
        )}
      </div>
      
      {/* Desktop view filters */}
      <div className="hidden md:block">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Form {...form}>
              {filterFormContent}
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 