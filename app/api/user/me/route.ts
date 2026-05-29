import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAiLimit } from "@/lib/plan";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, aiGenerationsThisMonth: true, aiGenerationsResetAt: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const now = new Date();
  const resetAt = user.aiGenerationsResetAt;
  const isSameMonth =
    resetAt.getFullYear() === now.getFullYear() &&
    resetAt.getMonth() === now.getMonth();

  const aiUsed = isSameMonth ? user.aiGenerationsThisMonth : 0;
  const aiLimit = getAiLimit(user.plan);

  return NextResponse.json({
    plan: user.plan,
    aiUsed,
    aiLimit: aiLimit === Infinity ? null : aiLimit,
  });
}

const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
