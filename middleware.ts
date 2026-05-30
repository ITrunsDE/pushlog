import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const locales = ["en", "de"] as const;
const defaultLocale = "en";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeDetection: true,
});

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Admin-Pfade direkt durchlassen
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // RSC-Requests (Next.js interne Fetches) durchlassen – nicht redirecten
  if (req.headers.get("RSC") === "1") {
    return NextResponse.next();
  }

  // Dashboard-Schutz für alle Locales
  const isDashboard = locales.some((l) => pathname.startsWith(`/${l}/dashboard`));

  if (isDashboard && !isLoggedIn) {
    const locale = locales.find((l) => pathname.startsWith(`/${l}/`)) ?? defaultLocale;
    return Response.redirect(new URL(`/${locale}/login`, req.nextUrl));
  }

  // Auth-Seiten für eingeloggte User sperren (alle Locales)
  const authPaths = ["/login", "/register"];
  const isAuthPage = locales.some((l) =>
    authPaths.some((p) => pathname.startsWith(`/${l}${p}`))
  );

  if (isAuthPage && isLoggedIn) {
    const locale = locales.find((l) => pathname.startsWith(`/${l}/`)) ?? defaultLocale;
    return Response.redirect(new URL(`/${locale}/dashboard`, req.nextUrl));
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|admin|.*\\..*).*)"],
};
