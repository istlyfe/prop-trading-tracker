import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Separate component that handles search params
function NotFoundContent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 py-12 text-center">
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <h2 className="text-xl text-muted-foreground">Page not found</h2>
      <p className="max-w-md text-muted-foreground mb-4">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <Button asChild>
        <Link href="/dashboard">Go back to dashboard</Link>
      </Button>
    </div>
  )
}

export default function NotFound() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  )
} 