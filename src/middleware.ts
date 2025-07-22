import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const isLoggedIn = !!req.nextauth.token
    
    // Protect API routes that require authentication
    if (req.nextUrl.pathname.startsWith("/api/github/") && !isLoggedIn) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    
    // Protect dashboard routes
    if (req.nextUrl.pathname.startsWith("/dashboard/") && !isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ["/api/github/:path*", "/dashboard/:path*"]
} 