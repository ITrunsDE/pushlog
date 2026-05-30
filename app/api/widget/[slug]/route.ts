import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");

    const product = await db.product.findFirst({
      where: { slug },
      include: {
        user: {
          select: { id: true, plan: true },
        },
        entries: {
          where: {
            isPublished: true,
            publishedAt: { not: null },
          },
          orderBy: { publishedAt: "desc" },
          select: {
            id: true,
            title: true,
            version: true,
            publishedAt: true,
            sections: {
              select: {
                id: true,
                type: true,
                items: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const isPro = product.user.plan === "pro";
    const maxLimit = isPro ? 10 : 5;
    const limit = Math.min(Math.max(parseInt(limitParam || "5", 10), 1), maxLimit);

    const entries = product.entries.slice(0, limit);

    const customCategories = await db.customCategory.findMany({
      where: { userId: product.user.id, deletedAt: null },
      select: { name: true, icon: true, label: true },
    });

    const response = NextResponse.json(
      {
        product: {
          name: product.name,
          slug: product.slug,
        },
        isPro,
        entries,
        customCategories,
      },
      { status: 200 }
    );

    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");

    return response;
  } catch (error) {
    console.error("Widget API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}
