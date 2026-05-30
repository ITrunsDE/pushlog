import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Link } from "@/lib/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { categoryBadgeClass } from "@/lib/badge-colors";

export default async function EntriesPage() {
  const t = await getTranslations("dashboard");
  const locale = await getLocale();
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const products = await db.product.findMany({
    where: { userId: session.user.id },
    include: {
      entries: {
        where: { isPublished: true },
        orderBy: { publishedAt: "desc" },
      },
    },
  });

  return (
    <div className="px-8 py-8">
      <h1 className="text-3xl font-medium text-[var(--text-dark)] font-[family-name:var(--font-display)] mb-2">
        {t("allEntries")}
      </h1>
      <p className="text-[var(--text-mid)] mb-8">{t("allEntriesDesc")}</p>

      {products.length === 0 ? (
        <div className="text-[var(--text-mid)]">
          <p>{t("noProducts")}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {products.map((product) => (
            <div key={product.id}>
              <h2 className="text-xl font-medium text-[var(--text-dark)] mb-4">{product.name}</h2>

              {product.entries.length === 0 ? (
                <p className="text-[var(--text-mid)]">{t("noPublishedEntries")}</p>
              ) : (
                <div className="space-y-4">
                  {product.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-lg p-4 border"
                      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-soft)" }}
                    >
                      <div className="flex items-center gap-2 mb-2 justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap ${categoryBadgeClass(entry.category)}`}
                          >
                            {entry.category}
                          </span>
                          <h3 className="text-sm font-medium text-[var(--text-dark)]">{entry.title}</h3>
                        </div>
                        <Link
                          href={`/dashboard/entries/${entry.id}/edit`}
                          className="text-xs font-medium text-[var(--primary)] hover:text-[var(--text-mid)] transition whitespace-nowrap ml-2"
                        >
                          {t("edit")}
                        </Link>
                      </div>
                      <p className="text-xs text-[var(--text-mid)] leading-relaxed mb-2 whitespace-pre-wrap">
                        {entry.body}
                      </p>
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
          ))}
        </div>
      )}
    </div>
  );
}
