import { NextResponse } from "next/server"
import { withAuth } from "next-auth/middleware"

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
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
  ],
} 