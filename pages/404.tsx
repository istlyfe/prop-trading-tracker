import Link from 'next/link'

export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 py-12 text-center">
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <h2 className="text-xl">Page not found</h2>
      <p className="max-w-md mb-4">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <Link href="/dashboard" className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
        Go back to dashboard
      </Link>
    </div>
  )
} 