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
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content:
            "Du bist ein Changelog-Assistent. Wandle Bullet Points in einen klaren, freundlichen Changelog-Eintrag um. Antworte nur mit dem fertigen Text, keine Erklärungen, kein Markdown.",
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

    const result = response.choices[0]?.message?.content || "";

    return NextResponse.json({ result });
  } catch (error) {
    console.error("OpenAI Error:", error);
    return NextResponse.json(
      { error: "KI-Verbesserung fehlgeschlagen" },
      { status: 500 }
    );
  }
}
