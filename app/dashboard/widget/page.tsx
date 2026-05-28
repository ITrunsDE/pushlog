import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { WidgetClient } from "./_components/widget-client";

export const dynamic = "force-dynamic";

export default async function WidgetPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="px-8 py-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">Unauthorized</p>
        </div>
      </div>
    );
  }

  let slug: string | null = null;
  let userPlan: string = "free";

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });

    if (user) {
      userPlan = user.plan;
    }

    const product = await db.product.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    });

    if (product) {
      slug = product.slug;
    }
  } catch (error) {
    console.error("Error fetching product:", error);
  }

  return <WidgetClient slug={slug} userPlan={userPlan} />;
}
