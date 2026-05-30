import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const locales = ["en", "de"] as const;
const defaultLocale = "en";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Handle locale-prefixed routes for non-default locales
  for (const locale of locales) {
    if (locale === defaultLocale) continue;
    if (pathname.startsWith(`/${locale}/dashboard`) && !isLoggedIn) {
      return Response.redirect(new URL(`/${locale}/login`, req.nextUrl));
    }
    if (
      ["/login", "/register"].some((p) => pathname.startsWith(`/${locale}${p}`)) &&
      isLoggedIn
    ) {
      return Response.redirect(new URL(`/${locale}/dashboard`, req.nextUrl));
    }
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|admin|.*\\..*).*)"],
};
