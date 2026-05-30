import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getActiveProduct } from "@/lib/active-product";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await getActiveProduct(session.user.id);
    if (!product) {
      return NextResponse.json({ error: "No product found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching active product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
