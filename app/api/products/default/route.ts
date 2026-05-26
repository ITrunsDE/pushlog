import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Produkt konnte nicht abgerufen werden" },
      { status: 500 }
    );
  }
}