import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { Resend } from "resend";
import { getSubscriberLimit } from "@/lib/plan";
import crypto from "node:crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

const subscribeSchema = z.object({
  email: z.string().email(),
  frequency: z.enum(["weekly", "monthly"]).default("weekly"),
});

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const product = await db.product.findFirst({
    where: { slug },
    include: { _count: { select: { subscribers: true } } },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = subscribeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request data", details: parsed.error.errors },
      { status: 400 }
    );
  }

  const { email, frequency } = parsed.data;

  // Check plan limit
  const user = await db.user.findUnique({
    where: { id: product.userId },
    select: { plan: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Product owner not found" }, { status: 404 });
  }

  const limit = getSubscriberLimit(user.plan);
  if (product._count.subscribers >= limit) {
    return NextResponse.json(
      { error: "Subscriber limit reached for this plan" },
      { status: 403 }
    );
  }

  // Check if already subscribed
  const existing = await db.subscriber.findUnique({
    where: { productId_email: { productId: product.id, email } },
  });

  if (existing?.confirmedAt) {
    return NextResponse.json(
      { error: "Already subscribed" },
      { status: 400 }
    );
  }

  // If unconfirmed, delete old token and create new one
  if (existing) {
    await db.subscriberConfirmToken.deleteMany({
      where: { subscriberId: existing.id },
    });
    await db.subscriber.delete({ where: { id: existing.id } });
  }

  // Create subscriber and token
  const token = crypto.randomBytes(32).toString("hex");
  const subscriber = await db.subscriber.create({
    data: {
      productId: product.id,
      email,
      digestFrequency: frequency,
    },
  });

  await db.subscriberConfirmToken.create({
    data: { subscriberId: subscriber.id, token },
  });

  // Send confirmation email
  const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/subscribe/confirm?token=${token}`;
  const subject = `Bitte bestätige deinen Newsletter für ${product.name}`;
  const html = generateConfirmationEmail(product.name, confirmUrl);

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@pushlog.io",
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    return NextResponse.json(
      { error: "Failed to send confirmation email" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Confirmation email sent" },
    { status: 200 }
  );
}

function generateConfirmationEmail(productName: string, confirmUrl: string): string {
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
            margin: 0 0 20px 0;
          }
          .button {
            display: inline-block;
            background-color: #BA7517;
            color: #fffdf8;
            text-decoration: none;
            padding: 12px 28px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
          }
          .button:hover {
            background-color: #9d6614;
          }
          .hint {
            color: #854F0B;
            font-size: 13px;
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid #FAC775;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Fast geschafft!</h1>
          <p>Klicke den Button um deine Anmeldung zu bestätigen.</p>
          <p style="margin-bottom: 28px;">
            <a href="${confirmUrl}" class="button">Anmeldung bestätigen</a>
          </p>
          <p class="hint">Du erhältst wöchentlich Updates für <strong>${productName}</strong>.</p>
        </div>
      </body>
    </html>
  `;
}
