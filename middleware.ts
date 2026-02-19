import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("providerToken")?.value;

  const { pathname } = req.nextUrl;

  // Allow public routes
  if (pathname.startsWith("/") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password") || pathname.startsWith("/reset-password")) {
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// Apply middleware only to dashboard routes
export const config = {
  matcher: ["/dashboard/:path*"],
};
