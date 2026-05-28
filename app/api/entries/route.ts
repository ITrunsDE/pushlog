import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createEntrySchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
  category: z.string().min(1, "Category is required"),
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

    const entry = await db.changelogEntry.create({
      data: {
        title: validatedData.title,
        body: validatedData.body,
        category: validatedData.category,
        productId: validatedData.productId,
        isPublished: true,
        publishedAt: new Date(),
      },
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