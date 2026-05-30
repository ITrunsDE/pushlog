import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getSubscriberLimit } from "@/lib/plan";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { getActiveProduct } from "@/lib/active-product";

export default async function SubscribersPage() {
  const t = await getTranslations("dashboard");
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, activeProduct] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    }),
    getActiveProduct(session.user.id),
  ]);

  const plan = user?.plan ?? "free";
  const productId = activeProduct?.id;

  let subscriberCount = 0;
  if (productId) {
    subscriberCount = await db.subscriber.count({
      where: { productId, confirmedAt: { not: null } },
    });
  }

  const limit = getSubscriberLimit(plan);
  const percentage = limit === Infinity ? 0 : Math.round((subscriberCount / limit) * 100);
  const showWarning = limit !== Infinity && percentage >= 80;

  return (
    <div className="px-8 py-8">
      <h1 className="text-3xl font-medium text-[var(--text-dark)] font-[family-name:var(--font-display)]">
        {t("subscribers")}
      </h1>
      <p className="text-[var(--text-mid)] mt-2">{t("subscribersDesc")}</p>

      {showWarning && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-300 rounded-lg">
          <p className="text-sm text-amber-800">
            {t("subscriberWarning", { current: subscriberCount, max: limit })}{" "}
            <Link href="/dashboard/settings" className="underline font-medium">
              {plan === "free" ? t("upgradeForSubscribers500") : t("upgradeForUnlimitedSubs")}
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
