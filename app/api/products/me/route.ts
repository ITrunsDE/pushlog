import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { customAlphabet } from "nanoid";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let products = await db.product.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    // Auto-create default product if none exist
    if (products.length === 0) {
      const nanoId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12);
      const newProduct = await db.product.create({
        data: {
          userId: session.user.id,
          name: "My Product",
          slug: nanoId(),
        },
      });
      products = [newProduct];
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
