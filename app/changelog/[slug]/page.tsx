import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import SubscribeForm from "./_components/subscribe-form";
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

const categoryColors: Record<string, { bg: string; text: string }> = {
  New: { bg: "#085041", text: "#9FE1CB" },
  Fix: { bg: "#FAEEDA", text: "#633806" },
  Improved: { bg: "#085041", text: "#9FE1CB" },
  Removed: { bg: "#FFE4E1", text: "#8B0000" },
};

export default async function ChangelogPage({ params, searchParams }: ChangelogPageProps) {
  const { slug } = await params;
  const { confirmed, unsubscribed } = await searchParams;

  const product = await db.product.findFirst({
    where: { slug },
    include: {
      user: { select: { plan: true } },
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
  const builtInCategories = new Set(Object.keys(categoryColors));
  const entries = canUseFeature(plan, "custom_categories")
    ? product.entries
    : product.entries.filter((e) => builtInCategories.has(e.category));
  const showBranding = !canUseFeature(plan, "white_label");

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#fffdf8" }}
    >
      <div className="max-w-2xl mx-auto px-6 py-12">
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
        <div className="space-y-6 mb-12">
          {entries.length === 0 ? (
            <div
              style={{ color: "#854F0B" }}
              className="text-center py-12"
            >
              <p>Noch keine Einträge veröffentlicht</p>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg p-6 border"
                style={{
                  backgroundColor: "#fef9ee",
                  borderColor: "#FAC775",
                }}
              >
                {/* Category Badge + Title */}
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="text-[10px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap"
                    style={{
                      backgroundColor: categoryColors[entry.category]?.bg || "#000",
                      color: categoryColors[entry.category]?.text || "#fff",
                    }}
                  >
                    {entry.category}
                  </span>
                  <h2
                    className="text-lg font-medium flex-1"
                    style={{ color: "#412402" }}
                  >
                    {entry.title}
                  </h2>
                </div>

                {/* Body */}
                <div
                  className="text-sm leading-relaxed whitespace-pre-wrap mb-4"
                  style={{ color: "#412402" }}
                >
                  {entry.body}
                </div>

                {/* Date */}
                <div
                  className="text-xs"
                  style={{ color: "#BA7517" }}
                >
                  {entry.publishedAt
                    ? new Date(entry.publishedAt).toLocaleDateString("de-DE", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Kein Datum"}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Subscribe Form */}
        <SubscribeForm slug={slug} />

        {showBranding && (
          <div className="mt-10 pt-6 text-center" style={{ borderTop: "1px solid #FAC775" }}>
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
    </div>
  );
}
