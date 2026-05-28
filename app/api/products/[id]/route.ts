import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  widgetColor: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const productId = params.id;

    const product = await db.product.findFirst({
      where: {
        id: productId,
        userId: session.user.id,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found or unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateProductSchema.parse(body);

    if (validatedData.slug !== product.slug) {
      const existingSlug = await db.product.findFirst({
        where: {
          slug: validatedData.slug,
          userId: session.user.id,
        },
      });

      if (existingSlug) {
        return NextResponse.json(
          { error: "Slug is already in use" },
          { status: 400 }
        );
      }
    }

    const updatedProduct = await db.product.update({
      where: { id: productId },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        ...(validatedData.widgetColor && { widgetColor: validatedData.widgetColor }),
      },
    });

    revalidatePath("/dashboard/widget");

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
