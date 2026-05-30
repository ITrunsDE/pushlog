import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Link } from "@/lib/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { categoryBadgeClass } from "@/lib/badge-colors";
import { DeleteEntryButton } from "./_components/delete-entry-button";
import { getActiveProduct } from "@/lib/active-product";

const SECTION_LABELS: Record<string, string> = {
  feature: "Feature",
  fix: "Fix",
  improvement: "Improvement",
  security: "Security",
  performance: "Performance",
};

export default async function EntriesPage() {
  const t = await getTranslations("dashboard");
  const locale = await getLocale();
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const activeProduct = await getActiveProduct(session.user.id);

  if (!activeProduct) {
    return (
      <div className="px-8 py-8">
        <h1 className="text-3xl font-medium text-[var(--text-dark)] font-[family-name:var(--font-display)] mb-2">
          {t("allEntries")}
        </h1>
        <p className="text-[var(--text-mid)]">{t("noProducts")}</p>
      </div>
    );
  }

  const product = await db.product.findUnique({
    where: { id: activeProduct.id },
    include: {
      entries: {
        where: { isPublished: true },
        orderBy: { publishedAt: "desc" },
        include: { sections: true },
      },
    },
  });

  const entries = product?.entries ?? [];

  return (
    <div className="px-8 py-8">
      <h1 className="text-3xl font-medium text-[var(--text-dark)] font-[family-name:var(--font-display)] mb-2">
        {t("allEntries")}
      </h1>
      <p className="text-[var(--text-mid)] mb-8">{t("allEntriesDesc")}</p>

      {entries.length === 0 ? (
        <p className="text-[var(--text-mid)]">{t("noPublishedEntries")}</p>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-lg p-4 border"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border-soft)",
              }}
            >
              <div className="flex items-start gap-2 mb-2 justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {entry.sections.map((s) => (
                      <span
                        key={s.id}
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap ${categoryBadgeClass(s.type)}`}
                      >
                        {SECTION_LABELS[s.type] ?? s.type}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-sm font-medium text-[var(--text-dark)]">
                    {entry.title}
                    {entry.version && (
                      <span className="ml-1.5 text-xs font-normal text-[var(--text-mid)]">
                        v{entry.version}
                      </span>
                    )}
                  </h3>
                </div>
                <div className="flex items-center gap-3 ml-2">
                  <Link
                    href={`/dashboard/entries/${entry.id}/edit`}
                    className="text-xs font-medium text-[var(--primary)] hover:text-[var(--text-mid)] transition whitespace-nowrap"
                  >
                    {t("edit")}
                  </Link>
                  <DeleteEntryButton id={entry.id} />
                </div>
              </div>
              <p className="text-xs text-[var(--primary)]">
                {entry.publishedAt
                  ? new Date(entry.publishedAt).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : t("noDate")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
