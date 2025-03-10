'use client'

import { Inter } from "next/font/google"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Something went wrong!</h1>
          <p className="max-w-md mb-4 text-red-500">
            {error.message || "An unexpected error occurred"}
          </p>
          <div className="flex gap-4">
            <button
              onClick={reset}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Try again
            </button>
            <Link href="/dashboard" className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-md">
              Go to dashboard
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
} 