import type { ReactNode } from "react"
import { metadata } from "./metadata"

interface TransactionLayoutProps {
  children: ReactNode
}

export { metadata }

export default function TransactionLayout({ children }: TransactionLayoutProps) {
  return children
} 