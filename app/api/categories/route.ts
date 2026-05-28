import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { canUseFeature } from "@/lib/plan";
import { NextResponse } from "next/server";

const STANDARD_CATEGORIES = [
  { name: "feature", label: "Feature", color: "#BA7517" },
  { name: "fix", label: "Fix", color: "#ef4444" },
  { name: "improvement", label: "Improvement", color: "#3b82f6" },
  { name: "security", label: "Security", color: "#22c55e" },
];

export async function GET(_req: Request) {
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

    const categories = [...STANDARD_CATEGORIES];

    if (canUseFeature(user.plan, "custom_categories")) {
      const customCategories = await db.customCategory.findMany({
        where: {
          userId: session.user.id,
          deletedAt: null,
        },
      });
      categories.push(
        ...customCategories.map((cat) => ({
          name: cat.name,
          label: cat.label,
          color: cat.color,
          isCustom: true,
          id: cat.id,
        }))
      );
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 20);
}

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

    if (!user || !canUseFeature(user.plan, "custom_categories")) {
      return NextResponse.json(
        { error: "Custom categories are a Pro feature" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, label, color } = body;

    if (!name || !label || !color) {
      return NextResponse.json(
        { error: "Missing required fields: name, label, color" },
        { status: 400 }
      );
    }

    const slugifiedName = slugifyName(name);
    if (!slugifiedName) {
      return NextResponse.json(
        { error: "Invalid category name" },
        { status: 400 }
      );
    }

    const categoryCount = await db.customCategory.count({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (categoryCount >= 10) {
      return NextResponse.json(
        { error: "Maximum 10 custom categories allowed" },
        { status: 400 }
      );
    }

    const existingCategory = await db.customCategory.findUnique({
      where: {
        userId_name: {
          userId: session.user.id,
          name: slugifiedName,
        },
      },
    });

    if (existingCategory && !existingCategory.deletedAt) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 400 }
      );
    }

    const category = existingCategory
      ? await db.customCategory.update({
          where: { id: existingCategory.id },
          data: {
            label,
            color,
            deletedAt: null,
          },
        })
      : await db.customCategory.create({
          data: {
            userId: session.user.id,
            name: slugifiedName,
            label,
            color,
          },
        });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
