import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();

    // Clear cookie when productId is null (e.g. after deleting active product)
    if (!productId) {
      const response = NextResponse.json({ ok: true });
      response.headers.set(
        "Set-Cookie",
        "active_product_id=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
      );
      return response;
    }

    const product = await db.product.findFirst({
      where: { id: productId, userId: session.user.id },
    });

    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const response = NextResponse.json({ ok: true });
    response.headers.set(
      "Set-Cookie",
      `active_product_id=${productId}; Path=/; HttpOnly; SameSite=Lax`
    );
    return response;
  } catch (error) {
    console.error("Error switching product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
