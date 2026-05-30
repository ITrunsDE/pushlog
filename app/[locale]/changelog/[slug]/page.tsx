import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import SubscribeForm from "./_components/subscribe-form";
import EntriesList from "./_components/entries-list";
import { canUseFeature } from "@/lib/plan";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

interface ChangelogPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ confirmed?: string; unsubscribed?: string }>;
}

const builtInCategories = new Set(["feature", "fix", "improvement", "security", "performance"]);

export default async function ChangelogPage({ params, searchParams }: ChangelogPageProps) {
  const t = await getTranslations("changelog");
  const { slug } = await params;
  const { confirmed, unsubscribed } = await searchParams;

  const product = await db.product.findFirst({
    where: { slug },
    include: {
      user: {
        select: {
          plan: true,
          locked: true,
          customCategories: {
            where: { deletedAt: null },
            select: { id: true, name: true, label: true },
          },
        },
      },
      entries: {
        where: { isPublished: true },
        orderBy: { publishedAt: "desc" },
      },
    },
  });

  if (!product) notFound();

  if (product.user.locked) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--background)" }}>
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2"
            style={{ color: "var(--text-dark)" }}>
            Nicht verfügbar
          </h1>
          <p style={{ color: "var(--text-mid)" }}>
            Diese Changelog-Seite ist derzeit nicht verfügbar.
          </p>
        </div>
      </div>
    )
  }

  const plan = product.user.plan;
  const isPro = canUseFeature(plan, "custom_categories");
  const entries = isPro
    ? product.entries
    : product.entries.filter((e) => builtInCategories.has(e.category));
  const customCategories = isPro ? product.user.customCategories : [];
  const showBranding = !canUseFeature(plan, "white_label");

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--background)" }}>
      <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-12">
        <div className="mb-12">
          <h1
            className="text-4xl font-semibold mb-2 font-[family-name:var(--font-display)]"
            style={{ color: "var(--text-dark)" }}
          >
            {product.name}
          </h1>
          <p style={{ color: "var(--text-mid)" }} className="text-sm">
            Changelog
          </p>
        </div>

        {confirmed && (
          <div
            className="mb-8 p-4 rounded-lg text-sm"
            style={{
              backgroundColor: "#E8F5E9",
              color: "#2E7D32",
              borderLeft: "4px solid #4CAF50",
            }}
          >
            {t("confirmed")}
          </div>
        )}

        {unsubscribed && (
          <div
            className="mb-8 p-4 rounded-lg text-sm"
            style={{
              backgroundColor: "#FCE4EC",
              color: "#C2185B",
              borderLeft: "4px solid #E91E63",
            }}
          >
            {t("unsubscribed")}
          </div>
        )}

        <EntriesList entries={entries} customCategories={customCategories} isPro={isPro} />
        <SubscribeForm slug={slug} ownerPlan={plan} />
      </div>

      {showBranding && (
        <div
          className="w-full py-4 text-center border-t"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-soft)" }}
        >
          <a
            href="https://pushlog.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs"
            style={{ color: "var(--primary)" }}
          >
            {t("poweredBy")} Pushlog
          </a>
        </div>
      )}
    </div>
  );
}
