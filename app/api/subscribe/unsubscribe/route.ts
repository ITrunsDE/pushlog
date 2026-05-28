import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const unsubscribeSchema = z.object({
  token: z.string(),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = unsubscribeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }

  const { token } = parsed.data;

  // Find subscriber by token (could be confirm token or encoded in unsubscribe link)
  // For now, we'll accept a special token format: "unsub_subscriberId"
  const subscriberId = token.startsWith("unsub_")
    ? token.replace("unsub_", "")
    : null;

  if (!subscriberId) {
    return NextResponse.json(
      { error: "Invalid unsubscribe token" },
      { status: 400 }
    );
  }

  const subscriber = await db.subscriber.findUnique({
    where: { id: subscriberId },
    include: { product: true },
  });

  if (!subscriber) {
    return NextResponse.json(
      { error: "Subscriber not found" },
      { status: 404 }
    );
  }

  // Send unsubscribe confirmation email
  const html = generateUnsubscribeEmail(subscriber.product.name);

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@pushlog.io",
      to: subscriber.email,
      subject: "Du wurdest abgemeldet",
      html,
    });
  } catch (error) {
    console.error("Failed to send unsubscribe confirmation email:", error);
  }

  // Delete subscriber
  await db.subscriber.delete({
    where: { id: subscriber.id },
  });

  return NextResponse.json(
    { message: "Unsubscribed successfully" },
    { status: 200 }
  );
}

function generateUnsubscribeEmail(productName: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif;
            background-color: #fffdf8;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fef9ee;
            border-radius: 8px;
            padding: 40px;
            border: 1px solid #FAC775;
          }
          h1 {
            color: #412402;
            font-size: 28px;
            margin: 0 0 16px 0;
            font-weight: 600;
          }
          p {
            color: #633806;
            font-size: 15px;
            line-height: 1.6;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Abgemeldet</h1>
          <p>Du erhältst keine weiteren Updates für <strong>${productName}</strong>.</p>
        </div>
      </body>
    </html>
  `;
}
