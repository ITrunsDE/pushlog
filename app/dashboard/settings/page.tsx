import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import ProductSettings from "./_components/product-settings";
import AccountSettings from "./_components/account-settings";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  const product = await db.product.findFirst({
    where: { userId: session.user.id },
  });

  if (!user || !product) {
    return (
      <div className="px-8 py-8">
        <h1 className="text-3xl font-medium text-[#2C2B28] font-[family-name:var(--font-display)] mb-2">
          Einstellungen
        </h1>
        <p className="text-[#633806]">Daten nicht gefunden</p>
      </div>
    );
  }

  return (
    <div className="px-8 py-8 max-w-2xl">
      <h1 className="text-3xl font-medium text-[#2C2B28] font-[family-name:var(--font-display)] mb-2">
        Einstellungen
      </h1>
      <p className="text-[#633806] mb-8">Widget-Code & Produkteinstellungen</p>

      <div className="space-y-6">
        <ProductSettings product={product} />
        <AccountSettings user={user} />
      </div>
    </div>
  );
}
