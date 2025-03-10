import { NextResponse } from "next/server"
import { withAuth } from "next-auth/middleware"

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    // Handle _not-found routes by redirecting to our custom 404 page
    if (req.nextUrl.pathname === '/_not-found') {
      return NextResponse.redirect(new URL('/404', req.url))
    }
    
    // Return NextResponse.next() if the route is allowed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // If there is a token, the user is authorized
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
)

// Protect these routes - user must be signed in to access
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/analytics/:path*",
    "/accounts/:path*",
    "/transactions/:path*",
    "/journal/:path*",
    "/consistency/:path*",
    "/_not-found", // Add _not-found to the matcher list
  ],
} 