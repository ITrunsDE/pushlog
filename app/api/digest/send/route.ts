import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get all confirmed subscribers with their product's owner plan
  const subscribers = await db.subscriber.findMany({
    where: { confirmedAt: { not: null } },
    include: {
      product: {
        include: { user: { select: { plan: true } } },
      },
    },
  });

  let sentCount = 0;
  let skippedCount = 0;

  for (const subscriber of subscribers) {
    // Free plan owners can only send monthly digests
    const ownerPlan = subscriber.product.user.plan;
    if (ownerPlan === "free" && subscriber.digestFrequency === "weekly") {
      skippedCount++;
      continue;
    }

    // Check if should send based on frequency
    const lastSent = subscriber.lastDigestSentAt;
    const shouldSendWeekly =
      subscriber.digestFrequency === "weekly" &&
      (!lastSent || lastSent < sevenDaysAgo);
    const shouldSendMonthly =
      subscriber.digestFrequency === "monthly" &&
      (!lastSent || lastSent < thirtyDaysAgo);

    if (!shouldSendWeekly && !shouldSendMonthly) {
      skippedCount++;
      continue;
    }

    // Load new entries since last digest
    const entries = await db.changelogEntry.findMany({
      where: {
        productId: subscriber.productId,
        isPublished: true,
        publishedAt: {
          gt: lastSent || new Date(0),
        },
      },
      orderBy: { publishedAt: "desc" },
      include: { sections: true },
    });

    if (entries.length === 0) {
      skippedCount++;
      continue;
    }

    // Send digest email
    const unsubToken = `unsub_${subscriber.id}`;
    const digestHtml = generateDigestEmail(
      subscriber.product.name,
      subscriber.product.slug,
      entries,
      unsubToken
    );

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "noreply@pushlog.io",
        to: subscriber.email,
        subject: `Was gibt's Neues bei ${subscriber.product.name}? 🚀`,
        html: digestHtml,
      });

      // Update lastDigestSentAt
      await db.subscriber.update({
        where: { id: subscriber.id },
        data: { lastDigestSentAt: now },
      });

      sentCount++;
    } catch (error) {
      console.error(`Failed to send digest to ${subscriber.email}:`, error);
      skippedCount++;
    }
  }

  return NextResponse.json(
    { sent: sentCount, skipped: skippedCount },
    { status: 200 }
  );
}

function generateDigestEmail(
  productName: string,
  productSlug: string,
  entries: any[],
  unsubToken: string
): string {
  const now = new Date();
  const monthYear = now.toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
  });

  const sectionColors: Record<string, { bg: string; text: string }> = {
    feature:     { bg: "#DBEAFE", text: "#1D4ED8" },
    fix:         { bg: "#FEE2E2", text: "#B91C1C" },
    improvement: { bg: "#FEF3C7", text: "#92400E" },
    security:    { bg: "#DCFCE7", text: "#166534" },
    performance: { bg: "#F3E8FF", text: "#7E22CE" },
  };

  const sectionLabels: Record<string, string> = {
    feature: "✨ Feature",
    fix: "🐛 Fix",
    improvement: "⚡ Improvement",
    security: "🔒 Security",
    performance: "🚀 Performance",
  };

  const entriesHtml = entries
    .map((entry) => {
      const dateStr = entry.publishedAt
        ? new Date(entry.publishedAt).toLocaleDateString("de-DE", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Kein Datum";

      const sectionsHtml = entry.sections
        .map((section: { type: string; items: string }) => {
          const color = sectionColors[section.type] || { bg: "#F4F4F5", text: "#52525B" };
          const label = sectionLabels[section.type] || section.type;
          const items: string[] = JSON.parse(section.items);
          const itemsHtml = items
            .map((item) => `<li style="margin: 4px 0; color: #412402; font-size: 14px;">${item}</li>`)
            .join("");
          return `
            <div style="margin-bottom: 12px;">
              <span style="display: inline-block; background-color: ${color.bg}; color: ${color.text}; padding: 3px 8px; border-radius: 8px; font-size: 11px; font-weight: 600; margin-bottom: 6px;">
                ${label}
              </span>
              <ul style="margin: 0; padding-left: 20px;">
                ${itemsHtml}
              </ul>
            </div>
          `;
        })
        .join("");

      return `
        <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #FAC775;">
          <h3 style="color: #412402; font-size: 18px; margin: 0 0 4px 0; font-weight: 600;">
            ${entry.title}${entry.version ? ` <span style="font-size: 13px; font-weight: 400; color: #854F0B;">v${entry.version}</span>` : ""}
          </h3>
          <p style="color: #BA7517; font-size: 12px; margin: 0 0 12px 0;">${dateStr}</p>
          ${sectionsHtml}
        </div>
      `;
    })
    .join("");

  const changelogUrl = `${process.env.NEXT_PUBLIC_APP_URL}/changelog/${productSlug}`;
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/subscribe/unsubscribe`;

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
            margin: 0 0 8px 0;
            font-weight: 600;
          }
          .subtitle {
            color: #854F0B;
            font-size: 14px;
            margin: 0 0 32px 0;
          }
          .footer {
            margin-top: 32px;
            padding-top: 16px;
            border-top: 1px solid #FAC775;
            font-size: 12px;
            color: #854F0B;
          }
          .footer a {
            color: #BA7517;
            text-decoration: none;
          }
          .footer a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>What's New – ${monthYear}</h1>
          <p class="subtitle">${productName}</p>

          ${entriesHtml}

          <div class="footer">
            <p style="margin: 0 0 12px 0;">
              <a href="${changelogUrl}">Vollständiges Changelog anschauen</a>
            </p>
            <form action="${unsubscribeUrl}" method="POST" style="margin: 0; display: inline;">
              <input type="hidden" name="token" value="${unsubToken}">
              <a href="#" onclick="this.parentElement.submit(); return false;">Abmelden</a>
            </form>
          </div>
        </div>
      </body>
    </html>
  `;
}
