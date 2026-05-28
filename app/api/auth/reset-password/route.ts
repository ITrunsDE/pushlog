import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = resetPasswordSchema.parse(body);

    // Find token
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return Response.json(
        { error: "Token ungültig oder abgelaufen" },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date() > resetToken.expiresAt) {
      // Delete expired token
      await db.passwordResetToken.delete({
        where: { id: resetToken.id },
      });

      return Response.json(
        { error: "Link abgelaufen. Bitte einen neuen anfordern." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Update user password
    await db.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    // Delete token
    await db.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return Response.json(
      { success: true, message: "Passwort erfolgreich geändert" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors[0].message }, { status: 400 });
    }

    console.error("Reset password error:", error);
    return Response.json(
      { error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}
