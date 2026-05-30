import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const sectionSchema = z.object({
  type: z.string().min(1),
  items: z.array(z.string()),
});

const updateEntrySchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  version: z.string().nullable().optional(),
  sections: z.array(sectionSchema).optional(),
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
      include: { product: true, sections: true },
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entry = await db.changelogEntry.findFirst({
    where: { id: params.id, product: { userId: session.user.id } },
  });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.changelogEntry.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
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

    if (validatedData.sections !== undefined) {
      await db.changelogSection.deleteMany({ where: { entryId } });
    }

    const updatedEntry = await db.changelogEntry.update({
      where: { id: entryId },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.version !== undefined && { version: validatedData.version || null }),
        ...(validatedData.sections !== undefined && {
          sections: {
            create: validatedData.sections.map((s) => ({
              type: s.type,
              items: JSON.stringify(s.items.filter((i) => i.trim())),
            })),
          },
        }),
      },
      include: { sections: true },
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
