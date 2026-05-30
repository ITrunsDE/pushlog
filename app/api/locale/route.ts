import { NextRequest, NextResponse } from "next/server";

const validLocales = ["en", "de"];

export async function POST(req: NextRequest) {
  const { locale } = await req.json();

  if (!validLocales.includes(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
  });
  return response;
}
