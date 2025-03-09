"use client"

import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Default to non-mobile during SSR to ensure consistent rendering
  const [isMobile, setIsMobile] = React.useState(false)
  const [hasMounted, setHasMounted] = React.useState(false)

  React.useEffect(() => {
    // Mark as mounted so we know we're on the client
    setHasMounted(true)
    
    // Check initial window size
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Set up resize listener
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    window.addEventListener('resize', handleResize)
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Return false during SSR, actual value after mounting
  return hasMounted ? isMobile : false
}
