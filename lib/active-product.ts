import { cookies } from "next/headers";
import { db } from "./db";

export async function getActiveProduct(userId: string) {
  const cookieStore = await cookies();
  const activeId = cookieStore.get("active_product_id")?.value;

  if (activeId) {
    const product = await db.product.findFirst({
      where: { id: activeId, userId },
    });
    if (product) return product;
  }

  return db.product.findFirst({
    where: { userId, isActive: true },
    orderBy: { createdAt: "asc" },
  });
}
