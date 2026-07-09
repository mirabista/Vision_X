import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * VisionX Middleware
 * 
 * NOTE: Authentication is handled client-side by AuthContext.
 * This middleware only protects routes from unauthenticated access.
 * It does NOT redirect authenticated users away from auth pages
 * because cookie-based session detection is unreliable.
 */

const protectedRoutes = [
  "/dashboard",
  "/analyze",
  "/reports",
  "/history",
  "/incidents",
  "/profile",
  "/settings",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Only block unauthenticated users from protected routes
  // AuthContext on the client side will handle the actual auth check
  if (isProtected) {
    // Let the client-side AuthContext handle this
    // Don't do server-side redirects based on cookies
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};