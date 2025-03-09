"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Account } from "@/types/account"
import { formatCurrency, formatDate } from "@/lib/utils"
import { AccountStatusHistory } from "@/components/accounts/account-status-history"
import { AccountStatusUpdate } from "@/components/accounts/account-status-update"
import { AccountTransactions } from "@/components/accounts/account-transactions"

interface AccountDetailsProps {
  account: Account
}

export function AccountDetails({ account }: AccountDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <Tabs defaultValue="overview" className="mt-6" onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="history">Status History</TabsTrigger>
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
      </TabsList>
      <div className="mt-4">
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Basic information about this prop trading account</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium leading-none">Firm Name</h3>
                  <p className="text-sm text-muted-foreground">{account.firmName}</p>
                </div>
                {account.accountName && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium leading-none">Account Name</h3>
                    <p className="text-sm text-muted-foreground">{account.accountName}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <h3 className="text-sm font-medium leading-none">Account Size</h3>
                  <p className="text-sm text-muted-foreground">{formatCurrency(account.accountSize)}</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium leading-none">Account Type</h3>
                  <p className="text-sm text-muted-foreground">{account.type}</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium leading-none">Current Status</h3>
                  <p className={`text-sm font-medium ${
                    account.status === 'funded' ? 'text-green-500' : 
                    account.status === 'blown' ? 'text-red-500' : 
                    'text-yellow-500'
                  } capitalize`}>
                    {account.status}
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium leading-none">Created Date</h3>
                  <p className="text-sm text-muted-foreground">{formatDate(account.createdAt)}</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium leading-none">Last Updated</h3>
                  <p className="text-sm text-muted-foreground">{formatDate(account.updatedAt)}</p>
                </div>
              </div>
              {account.notes && (
                <div className="space-y-1">
                  <h3 className="text-sm font-medium leading-none">Notes</h3>
                  <p className="text-sm text-muted-foreground">{account.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history" className="space-y-6">
          <AccountStatusUpdate account={account} />
          <AccountStatusHistory account={account} />
        </TabsContent>
        <TabsContent value="transactions">
          <AccountTransactions account={account} />
        </TabsContent>
      </div>
    </Tabs>
  )
}

