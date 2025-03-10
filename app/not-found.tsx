'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the pages/404 instead - this bypasses the app router's not-found handling
    router.replace('/404')
  }, [router])
  
  // Show loading spinner or nothing while redirecting
  return <div>Redirecting...</div>
} 