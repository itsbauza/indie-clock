import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  
  // Protect API routes that require authentication
  if (req.nextUrl.pathname.startsWith("/api/github/") && !isLoggedIn) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
  
  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith("/dashboard/") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }
})

export const config = {
  matcher: [
    "/api/github/:path*",
    "/dashboard/:path*",
  ],
} 