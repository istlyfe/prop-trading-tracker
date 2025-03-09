import type { ReactNode } from "react"
import { metadata } from "./metadata"

interface AccountTransactionLayoutProps {
  children: ReactNode
}

export { metadata }

export default function AccountTransactionLayout({ children }: AccountTransactionLayoutProps) {
  return children
} 