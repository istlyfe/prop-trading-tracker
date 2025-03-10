'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 py-12 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Something went wrong!</h1>
      <p className="max-w-md mb-4">
        We've encountered an unexpected error. You can try to reset the page or go back to the dashboard.
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
  )
} 