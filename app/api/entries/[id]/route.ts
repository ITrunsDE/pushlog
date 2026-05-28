import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateEntrySchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  body: z.string().min(1, "Body is required").optional(),
  category: z.string().min(1, "Category is required").optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entryId = params.id;

    const entry = await db.changelogEntry.findFirst({
      where: { id: entryId },
      include: { product: true },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Entry not found" },
        { status: 404 }
      );
    }

    if (entry.product.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(entry, { status: 200 });
  } catch (error) {
    console.error("Error fetching entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entryId = params.id;

    const entry = await db.changelogEntry.findFirst({
      where: { id: entryId },
      include: { product: true },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Entry not found" },
        { status: 404 }
      );
    }

    if (entry.product.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateEntrySchema.parse(body);

    const updatedEntry = await db.changelogEntry.update({
      where: { id: entryId },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.body && { body: validatedData.body }),
        ...(validatedData.category && { category: validatedData.category }),
      },
    });

    return NextResponse.json(updatedEntry, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
