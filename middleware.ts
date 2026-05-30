import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const locales = ["en", "de"] as const;
const defaultLocale = "en";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
  localeDetection: false,
});

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Admin-Pfade direkt durchlassen
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Dashboard-Schutz für alle Locales
  const isDashboard =
    pathname.startsWith("/dashboard") ||
    locales.some((l) => pathname.startsWith(`/${l}/dashboard`));

  if (isDashboard && !isLoggedIn) {
    const locale =
      locales.find((l) => pathname.startsWith(`/${l}/`)) ?? defaultLocale;
    const loginPath =
      locale === defaultLocale ? "/login" : `/${locale}/login`;
    return Response.redirect(new URL(loginPath, req.nextUrl));
  }

  // Auth-Seiten für eingeloggte User sperren (alle Locales)
  const authPaths = ["/login", "/register"];
  const isAuthPage =
    authPaths.some((p) => pathname.startsWith(p)) ||
    locales.some((l) => authPaths.some((p) => pathname.startsWith(`/${l}${p}`)));

  if (isAuthPage && isLoggedIn) {
    const locale =
      locales.find((l) => pathname.startsWith(`/${l}/`)) ?? defaultLocale;
    const dashPath =
      locale === defaultLocale ? "/dashboard" : `/${locale}/dashboard`;
    return Response.redirect(new URL(dashPath, req.nextUrl));
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|admin|.*\\..*).*)"],
};
