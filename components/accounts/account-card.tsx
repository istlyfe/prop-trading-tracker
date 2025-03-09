import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Account, AccountStatus } from "@/types/account"
import { formatCurrency } from "@/lib/utils"

interface AccountCardProps {
  account: Account
}

export function AccountCard({ account }: AccountCardProps) {
  const statusColors: Record<AccountStatus, string> = {
    evaluation: "bg-yellow-500",
    funded: "bg-green-500",
    blown: "bg-red-500",
  }

  return (
    <Link href={`/accounts/${account.id}`} className="block transition-all">
      <Card className="hover:bg-muted/50 hover:shadow-md transition-all cursor-pointer border-2 hover:border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div>
            <CardTitle className="text-base">{account.firmName}</CardTitle>
            {account.accountName && (
              <CardDescription className="text-sm">{account.accountName}</CardDescription>
            )}
          </div>
          <Badge className={statusColors[account.status]}>
            {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
          </Badge>
        </CardHeader>
        <CardContent>
          <CardDescription className="flex justify-between">
            <span>Account Size:</span>
            <span className="font-medium">{formatCurrency(account.accountSize)}</span>
          </CardDescription>
          <CardDescription className="flex justify-between">
            <span>Type:</span>
            <span className="font-medium">{account.type}</span>
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  )
}

