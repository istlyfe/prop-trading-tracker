"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Account, AccountStatus } from "@/types/account"
import { formatDate } from "@/lib/utils"

interface AccountStatusHistoryProps {
  account: Account
}

export function AccountStatusHistory({ account }: AccountStatusHistoryProps) {
  // Status color mapping
  const statusColors: Record<AccountStatus, string> = {
    evaluation: "bg-yellow-500",
    funded: "bg-green-500",
    blown: "bg-red-500",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status History</CardTitle>
        <CardDescription>Track the status changes of this account over time</CardDescription>
      </CardHeader>
      <CardContent>
        {account.statusHistory && account.statusHistory.length > 0 ? (
          <div className="space-y-8">
            {/* Reverse to show newest status first */}
            {[...account.statusHistory].reverse().map((history, index, arr) => (
              <div key={index} className="flex">
                <div className="flex flex-col items-center mr-3 sm:mr-4">
                  <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full text-white ${statusColors[history.status]}`}>
                    <span className="text-xs sm:text-sm font-medium">{arr.length - index}</span>
                  </div>
                  {index < arr.length - 1 && (
                    <div className="h-full w-px bg-border mt-2 mb-2" />
                  )}
                </div>
                <div className="space-y-1 pt-1">
                  <div className="flex items-center">
                    <p className="text-sm font-medium capitalize">{history.status}</p>
                    <span className={`ml-2 inline-flex h-2 w-2 rounded-full ${statusColors[history.status]}`} />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{formatDate(history.date)}</p>
                  {history.notes && (
                    <div className="mt-2 rounded-md bg-muted p-2 sm:p-3">
                      <p className="text-xs sm:text-sm text-muted-foreground">{history.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed">
            <p className="text-sm text-muted-foreground">No status history available for this account.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

