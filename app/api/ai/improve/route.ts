import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { bullets } = await request.json();

    if (!bullets || typeof bullets !== "string") {
      return NextResponse.json(
        { error: "Bullet Points erforderlich" },
        { status: 400 }
      );
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
