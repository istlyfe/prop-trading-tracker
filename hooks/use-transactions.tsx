"use client"

import { useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import type { Transaction } from "@/types/transaction"
import { useToast } from "@/hooks/use-toast"

// No default transactions

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Load transactions from localStorage
    const loadTransactions = () => {
      try {
        const savedTransactions = localStorage.getItem("propTracker_transactions")
        if (savedTransactions) {
          setTransactions(JSON.parse(savedTransactions))
        } else {
          // Start with empty transactions array
          setTransactions([])
          localStorage.setItem("propTracker_transactions", JSON.stringify([]))
        }
      } catch (error) {
        console.error("Error loading transactions:", error)
        toast({
          title: "Error loading transactions",
          description: "There was a problem loading your transactions data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [toast])

  const saveTransactions = (updatedTransactions: Transaction[]) => {
    try {
      localStorage.setItem("propTracker_transactions", JSON.stringify(updatedTransactions))
      setTransactions(updatedTransactions)
    } catch (error) {
      console.error("Error saving transactions:", error)
      toast({
        title: "Error saving transactions",
        description: "There was a problem saving your transactions data.",
        variant: "destructive",
      })
    }
  }

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4(),
    }

    const updatedTransactions = [...transactions, newTransaction]
    saveTransactions(updatedTransactions)

    toast({
      title: "Transaction added",
      description: `${transaction.description || transaction.type} has been added successfully.`,
    })

    return newTransaction
  }

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const transactionIndex = transactions.findIndex((tx) => tx.id === id)

    if (transactionIndex === -1) {
      toast({
        title: "Transaction not found",
        description: "The transaction you're trying to update doesn't exist.",
        variant: "destructive",
      })
      return null
    }

    const updatedTransaction = {
      ...transactions[transactionIndex],
      ...updates,
    }

    const updatedTransactions = [...transactions]
    updatedTransactions[transactionIndex] = updatedTransaction

    saveTransactions(updatedTransactions)

    toast({
      title: "Transaction updated",
      description: `Transaction has been updated successfully.`,
    })

    return updatedTransaction
  }

  const deleteTransaction = (id: string) => {
    const transactionToDelete = transactions.find((tx) => tx.id === id)

    if (!transactionToDelete) {
      toast({
        title: "Transaction not found",
        description: "The transaction you're trying to delete doesn't exist.",
        variant: "destructive",
      })
      return false
    }

    const updatedTransactions = transactions.filter((tx) => tx.id !== id)
    saveTransactions(updatedTransactions)

    toast({
      title: "Transaction deleted",
      description: `Transaction has been deleted successfully.`,
    })

    return true
  }

  const getTransactionById = (id: string) => {
    return transactions.find((tx) => tx.id === id) || null
  }

  const getTransactionsByAccountId = (accountId: string) => {
    return transactions.filter((tx) => tx.accountId === accountId)
  }

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
    getTransactionsByAccountId,
    saveTransactions,
  }
}

