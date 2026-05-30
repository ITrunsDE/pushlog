import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import ProductSettings from "./_components/product-settings";
import AccountSettings from "./_components/account-settings";
import PlanSettings from "./_components/plan-settings";
import { CategoriesSettings } from "./_components/categories-settings";
import SubscriberSettings from "./_components/subscriber-settings";
import { getActiveProduct } from "@/lib/active-product";
import { SettingsTabs } from "./_components/settings-tabs";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, product] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id } }),
    getActiveProduct(session.user.id),
  ]);

  const params = await searchParams;

  if (!user || !product) {
    return (
      <div className="px-8 py-8">
        <h1 className="text-3xl font-medium text-[var(--text-dark)] font-[family-name:var(--font-display)] mb-2">
          Einstellungen
        </h1>
        <p className="text-[var(--text-mid)]">Daten nicht gefunden</p>
      </div>
    );
  }

  const tabs = [
    {
      id: "produkt",
      label: "Produkt",
      content: <ProductSettings product={product} />,
    },
    {
      id: "kategorien",
      label: "Kategorien",
      content: <CategoriesSettings plan={user.plan} />,
    },
    {
      id: "abonnenten",
      label: "Abonnenten",
      content: <SubscriberSettings productId={product.id} plan={user.plan} />,
    },
    {
      id: "account",
      label: "Account",
      content: (
        <div className="space-y-6">
          <PlanSettings user={user} />
          <AccountSettings user={user} />
        </div>
      ),
    },
  ];

  return (
    <div className="px-8 py-8 max-w-2xl">
      <h1 className="text-3xl font-medium text-[var(--text-dark)] font-[family-name:var(--font-display)] mb-2">
        Einstellungen
      </h1>
      <p className="text-[var(--text-mid)] mb-8">Verwalte dein Produkt und deinen Account</p>

      <SettingsTabs tabs={tabs} defaultTab={params.tab ?? "produkt"} />
    </div>
  );
}
