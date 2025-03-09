"use client"

import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AccountCard } from "@/components/accounts/account-card"
import { useAccounts } from "@/hooks/use-accounts"

interface AccountsOverviewProps {
  className?: string
}

export function AccountsOverview({ className }: AccountsOverviewProps) {
  const { accounts } = useAccounts()

  const recentAccounts = accounts.slice(0, 3)

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-1">
          <CardTitle>Accounts</CardTitle>
          <CardDescription>You have {accounts.length} total accounts</CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="/accounts/new">
            <PlusCircle className="h-4 w-4" />
            Add Account
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        {recentAccounts.length > 0 ? (
          recentAccounts.map((account) => <AccountCard key={account.id} account={account} />)
        ) : (
          <div className="flex h-[120px] items-center justify-center rounded-md border border-dashed">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">
                No accounts added yet. Click the button above to add your first account.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      {accounts.length > 3 && (
        <CardFooter>
          <Button asChild variant="ghost" className="w-full" size="sm">
            <Link href="/accounts">View all accounts</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

