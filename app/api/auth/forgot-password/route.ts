import { db } from "@/lib/db";
import { Resend } from "resend";
import { randomBytes } from "node:crypto";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email: rawEmail } = forgotPasswordSchema.parse(body);
    const email = rawEmail.toLowerCase();

    // Try to find user (but don't leak info - always return 200)
    const user = await db.user.findUnique({
      where: { email },
    });

    // Delete old tokens for this email
    await db.passwordResetToken.deleteMany({
      where: { email },
    });

    // If user exists, create reset token
    if (user) {
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.passwordResetToken.create({
        data: {
          email,
          token,
          expiresAt,
        },
      });

      // Send email
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "noreply@pushlog.io",
        to: email,
        subject: "Dein Pushlog Passwort zurücksetzen",
        html: generateResetEmail(resetUrl),
      });
    }

    // Always return 200 to prevent user enumeration
    return Response.json(
      {
        success: true,
        message: "Falls diese E-Mail registriert ist, erhältst du in Kürze einen Link.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    // Return 200 even on error to prevent user enumeration
    return Response.json(
      {
        success: true,
        message: "Falls diese E-Mail registriert ist, erhältst du in Kürze einen Link.",
      },
      { status: 200 }
    );
  }
}

function generateResetEmail(resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #fffdf8; }
          .header { background: #fffdf8; padding: 24px; border-bottom: 1px solid #FAC775; }
          .content { padding: 32px 24px; }
          h1 { color: #2C2B28; font-size: 24px; margin: 0 0 16px 0; }
          p { color: #633806; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; }
          .button {
            display: inline-block;
            padding: 12px 32px;
            background: #BA7517;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            margin: 24px 0;
          }
          .button:hover { background: #9a6514; }
          .footer { padding: 24px; color: #633806; font-size: 14px; border-top: 1px solid #FAC775; text-align: center; }
          .divider { height: 1px; background: #FAC775; margin: 24px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Passwort zurücksetzen</h1>
          </div>
          <div class="content">
            <p>Du hast eine Passwort-Zurücksetzung angefordert.</p>
            <p>Klicke auf den Button unten, um dein Passwort zu ändern:</p>
            <a href="${resetUrl}" class="button">Passwort zurücksetzen</a>
            <p style="color: #999; font-size: 14px;">Dieser Link ist 1 Stunde gültig.</p>
            <div class="divider"></div>
            <p>Falls du das nicht angefordert hast, ignoriere diese E-Mail.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Pushlog. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
