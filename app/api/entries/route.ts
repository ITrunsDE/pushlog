import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Check auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, body, category } = await request.json();

    if (!title || !body || !category) {
      return NextResponse.json(
        { error: "Title, body, und category erforderlich" },
        { status: 400 }
      );
    }

    // Get user's first product
    const product = await db.product.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Keine Produkte gefunden" },
        { status: 404 }
      );
    }

    // Create changelog entry
    const entry = await db.changelogEntry.create({
      data: {
        productId: product.id,
        title,
        body,
        category,
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Error creating entry:", error);
    return NextResponse.json(
      { error: "Eintrag konnte nicht erstellt werden" },
      { status: 500 }
    );
  }
}
