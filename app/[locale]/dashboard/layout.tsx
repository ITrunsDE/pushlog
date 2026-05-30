import { Link } from "@/lib/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SidebarUserBlock } from "./_components/sidebar-user-block";
import { ProductSwitcher } from "./_components/product-switcher";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeSync } from "@/components/theme-sync";
import { getTranslations } from "next-intl/server";
import { ExternalLink } from "lucide-react";
import { getActiveProduct } from "@/lib/active-product";
import { canUseFeature } from "@/lib/plan";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [t, tDash] = await Promise.all([
    getTranslations("nav"),
    getTranslations("dashboard"),
  ]);
  const session = await auth();

  let userPlan = "free";
  let userTheme = "system";
  let products: { id: string; name: string; slug: string; isActive: boolean }[] = [];
  let activeProduct: { id: string; name: string; slug: string; isActive: boolean } | null = null;

  if (session?.user?.id) {
    const [user, allProducts] = await Promise.all([
      db.user.findUnique({
        where: { id: session.user.id },
        select: { plan: true, theme: true },
      }),
      db.product.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, slug: true, isActive: true },
      }),
    ]);
    userPlan = user?.plan || "free";
    userTheme = user?.theme || "system";
    products = allProducts;
    activeProduct = await getActiveProduct(session.user.id);
  }

  const navItems = [
    { href: "/dashboard", label: t("dashboard") },
    { href: "/dashboard/entries", label: t("entries") },
    { href: "/dashboard/widget", label: t("widget") },
    { href: "/dashboard/settings", label: t("settings") },
  ];

  const isPro = canUseFeature(userPlan, "multiple_products");

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <ThemeSync theme={userTheme} />
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-56 bg-[var(--surface)] border-r border-[var(--border-soft)] flex-col z-40">
        <div className="px-6 py-6 border-b border-[var(--border-soft)]">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
              <div className="w-5 h-5 bg-[var(--primary)] rounded-[4px]" />
              <span className="text-sm font-medium text-[var(--text-dark)]">pushlog</span>
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle isLoggedIn={!!session?.user?.id} />
              <LocaleSwitcher />
            </div>
          </div>
          {activeProduct?.slug && (
            <a
              href={`/changelog/${activeProduct.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs flex items-center gap-1 hover:underline mt-1.5"
              style={{ color: "var(--text-weak)" }}
            >
              <ExternalLink size={11} />
              {tDash("viewPublicPage")}
            </a>
          )}
        </div>

        {activeProduct && products.length > 0 && (
          <div className="px-3 pt-4 pb-2 border-b border-[var(--border-soft)]">
            <ProductSwitcher
              products={products}
              activeProduct={activeProduct}
              isPro={isPro}
            />
          </div>
        )}

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2.5 text-sm text-[var(--text-mid)] hover:bg-[var(--surface)] rounded-lg transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {session?.user?.email && (
          <SidebarUserBlock email={session.user.email} plan={userPlan} />
        )}
      </aside>
      <main className="md:ml-56 overflow-auto">{children}</main>
    </div>
  );
}
