import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, turnstileToken } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Fehlende erforderliche Felder" },
        { status: 400 }
      );
    }

    if (process.env.NODE_ENV === "production") {
      const verification = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            secret: process.env.TURNSTILE_SECRET_KEY,
            response: turnstileToken,
          }),
        }
      );
      const verifyResult = await verification.json();
      if (!verifyResult.success) {
        return NextResponse.json(
          { error: "Captcha-Verifizierung fehlgeschlagen." },
          { status: 400 }
        );
      }
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Passwort muss mindestens 6 Zeichen lang sein" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "E-Mail ist bereits registriert" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    await db.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registrierung fehlgeschlagen" },
      { status: 500 }
    );
  }
}
