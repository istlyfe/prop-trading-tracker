"use client"

import { CalendarClock, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
import type { Account } from "@/types/account"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { useAccounts } from "@/hooks/use-accounts"
import { useToast } from "@/hooks/use-toast"

interface AccountHeaderProps {
  account: Account
}

export function AccountHeader({ account }: AccountHeaderProps) {
  const router = useRouter()
  const { deleteAccount } = useAccounts()
  const { toast } = useToast()
  
  const statusColors = {
    evaluation: "bg-yellow-500",
    funded: "bg-green-500",
    blown: "bg-red-500",
  }

  const handleDelete = () => {
    if (deleteAccount(account.id)) {
      router.push("/accounts")
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="grid gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold break-words">{account.firmName}</h1>
          <Badge className={statusColors[account.status]}>
            {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
          </Badge>
        </div>
        {account.accountName && (
          <div className="text-muted-foreground">
            {account.accountName}
          </div>
        )}
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <CalendarClock className="h-4 w-4" />
          <span>Created on {formatDate(account.createdAt)}</span>
        </div>
      </div>
      <div className="flex space-x-2 self-end sm:self-auto">
        <Button asChild variant="outline" size="sm">
          <Link href={`/accounts/${account.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Edit</span>
          </Link>
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the account
                and all associated transactions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

