import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAiLimit } from "@/lib/plan";

export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bullets } = await request.json();

    if (!bullets || typeof bullets !== "string") {
      return NextResponse.json(
        { error: "Bullet Points erforderlich" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, aiGenerationsThisMonth: true, aiGenerationsResetAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const aiLimit = getAiLimit(user.plan);

    if (aiLimit !== Infinity) {
      const now = new Date();
      const resetAt = user.aiGenerationsResetAt;
      const isSameMonth =
        resetAt.getFullYear() === now.getFullYear() &&
        resetAt.getMonth() === now.getMonth();

      let currentCount = user.aiGenerationsThisMonth;

      if (!isSameMonth) {
        await db.user.update({
          where: { id: session.user.id },
          data: { aiGenerationsThisMonth: 0, aiGenerationsResetAt: now },
        });
        currentCount = 0;
      }

      if (currentCount >= aiLimit) {
        return NextResponse.json({ error: "ai_limit_reached" }, { status: 403 });
      }
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content: `Du bist ein Changelog-Assistent. Analysiere die gegebenen Bullet Points und strukturiere sie in Sektionen.

Antworte NUR mit validem JSON in diesem Format:
{
  "title": "Kurzer prägnanter Release-Titel",
  "version": null,
  "sections": [
    {
      "type": "feature",
      "items": ["Item 1", "Item 2"]
    }
  ]
}

Erlaubte Typen: "feature", "fix", "improvement", "security", "performance"
Nur Typen verwenden die auch Einträge haben.
Leere Sektionen weglassen.
Items als vollständige, lesbare Sätze formulieren.`,
        },
        {
          role: "user",
          content: bullets,
        },
      ],
    });

    if (aiLimit !== Infinity) {
      await db.user.update({
        where: { id: session.user.id },
        data: { aiGenerationsThisMonth: { increment: 1 } },
      });
    }

    const raw = response.choices[0]?.message?.content || "{}";

    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "KI-Verbesserung fehlgeschlagen" },
        { status: 500 }
      );
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("OpenAI Error:", error);
    return NextResponse.json(
      { error: "KI-Verbesserung fehlgeschlagen" },
      { status: 500 }
    );
  }
}
