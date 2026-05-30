import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEntryLimit } from "@/lib/plan";
import { z } from "zod";

export const dynamic = "force-dynamic";

const sectionSchema = z.object({
  type: z.string().min(1),
  items: z.array(z.string()),
});

const createEntrySchema = z.object({
  title: z.string().min(1, "Title is required"),
  version: z.string().nullable().optional(),
  sections: z.array(sectionSchema).min(1, "At least one section is required"),
  productId: z.string().min(1, "Product ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createEntrySchema.parse(body);

    const product = await db.product.findFirst({
      where: {
        id: validatedData.productId,
        userId: session.user.id,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found or unauthorized" },
        { status: 403 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });

    const entryLimit = getEntryLimit(user?.plan ?? "free");
    if (entryLimit !== Infinity) {
      const entryCount = await db.changelogEntry.count({
        where: { productId: validatedData.productId },
      });
      if (entryCount >= entryLimit) {
        return NextResponse.json({ error: "entry_limit_reached" }, { status: 403 });
      }
    }

    const entry = await db.changelogEntry.create({
      data: {
        title: validatedData.title,
        version: validatedData.version || null,
        productId: validatedData.productId,
        isPublished: true,
        publishedAt: new Date(),
        sections: {
          create: validatedData.sections.map((s) => ({
            type: s.type,
            items: JSON.stringify(s.items.filter((i) => i.trim())),
          })),
        },
      },
      include: { sections: true },
    });

    revalidatePath("/dashboard/widget");

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
