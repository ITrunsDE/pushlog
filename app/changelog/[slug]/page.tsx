import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import SubscribeForm from "./_components/subscribe-form";
import EntriesList from "./_components/entries-list";
import { canUseFeature } from "@/lib/plan";

export const dynamic = "force-dynamic";

interface ChangelogPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    confirmed?: string;
    unsubscribed?: string;
  }>;
}

const builtInCategories = new Set(["New", "Fix", "Improved", "Removed"]);

export default async function ChangelogPage({ params, searchParams }: ChangelogPageProps) {
  const { slug } = await params;
  const { confirmed, unsubscribed } = await searchParams;

  const product = await db.product.findFirst({
    where: { slug },
    include: {
      user: {
        select: {
          plan: true,
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

  if (!product) {
    notFound();
  }

  const plan = product.user.plan;
  const isPro = canUseFeature(plan, "custom_categories");
  const entries = isPro
    ? product.entries
    : product.entries.filter((e) => builtInCategories.has(e.category));
  const customCategories = isPro ? product.user.customCategories : [];
  const showBranding = !canUseFeature(plan, "white_label");

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#fffdf8" }}
    >
      <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1
            className="text-4xl font-semibold mb-2 font-[family-name:var(--font-display)]"
            style={{ color: "#412402" }}
          >
            {product.name}
          </h1>
          <p style={{ color: "#854F0B" }} className="text-sm">
            Changelog
          </p>
        </div>

        {/* Status Messages */}
        {confirmed && (
          <div
            className="mb-8 p-4 rounded-lg text-sm"
            style={{
              backgroundColor: "#E8F5E9",
              color: "#2E7D32",
              borderLeft: "4px solid #4CAF50",
            }}
          >
            ✓ Erfolgreich bestätigt! Du erhältst nun regelmäßig Updates.
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
            Erfolgreich abgemeldet. Du erhältst keine weiteren Updates.
          </div>
        )}

        {/* Entries */}
        <EntriesList entries={entries} customCategories={customCategories} isPro={isPro} />

        {/* Subscribe Form */}
        <SubscribeForm slug={slug} ownerPlan={plan} />
      </div>

      {showBranding && (
        <div
          className="w-full py-4 text-center border-t"
          style={{ backgroundColor: "#fef9ee", borderColor: "#FAC775" }}
        >
          <a
            href="https://pushlog.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs"
            style={{ color: "#BA7517" }}
          >
            Powered by Pushlog
          </a>
        </div>
      )}
    </div>
  );
}
