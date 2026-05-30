import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { canUseFeature } from "@/lib/plan";
import { NewProductForm } from "./_components/new-product-form";
import { getTranslations } from "next-intl/server";

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });

  if (!user || !canUseFeature(user.plan, "multiple_products")) {
    redirect("/dashboard/settings");
  }

  const t = await getTranslations("dashboard");

  return (
    <div className="px-8 py-8 max-w-md">
      <h1 className="text-3xl font-medium text-[var(--text-dark)] font-[family-name:var(--font-display)] mb-2">
        {t("newProductTitle")}
      </h1>
      <p className="text-[var(--text-mid)] mb-8">
        {t("newProductSubtitle")}
      </p>
      <NewProductForm />
    </div>
  );
}
