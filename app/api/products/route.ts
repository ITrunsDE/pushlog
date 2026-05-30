import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { canUseFeature } from "@/lib/plan";
import { customAlphabet } from "nanoid";

const nanoId = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12);

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingCount = await db.product.count({
      where: { userId: session.user.id },
    });

    if (!canUseFeature(user.plan, "multiple_products") && existingCount >= 1) {
      return NextResponse.json({ error: "upgrade_required" }, { status: 403 });
    }

    const { name } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const product = await db.product.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        slug: nanoId(),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
