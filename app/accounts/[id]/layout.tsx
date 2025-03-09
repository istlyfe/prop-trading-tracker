import type { ReactNode } from "react"
import { metadata } from "./metadata"

interface AccountLayoutProps {
  children: ReactNode
}

export { metadata }

export default function AccountLayout({ children }: AccountLayoutProps) {
  return children
} 