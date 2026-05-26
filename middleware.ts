import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("auth.session_token")?.value;

  const protectedRoutes = ["/dashboard"];
  const authRoutes = ["/login", "/register"];

  if (protectedRoutes.some((r) => pathname.startsWith(r)) && !sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (authRoutes.some((r) => pathname.startsWith(r)) && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
