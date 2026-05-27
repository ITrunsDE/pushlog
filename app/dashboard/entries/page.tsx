import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function EntriesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const products = await db.product.findMany({
    where: { userId: session.user.id },
    include: {
      entries: {
        where: { isPublished: true },
        orderBy: { publishedAt: "desc" },
      },
    },
  });

  const categoryColors: Record<string, { bg: string; text: string }> = {
    New: { bg: "#085041", text: "#9FE1CB" },
    Fix: { bg: "#FAEEDA", text: "#633806" },
    Improved: { bg: "#085041", text: "#9FE1CB" },
    Removed: { bg: "#FFE4E1", text: "#8B0000" },
  };

  return (
    <div className="px-8 py-8">
      <h1 className="text-3xl font-medium text-[#2C2B28] font-[family-name:var(--font-display)] mb-2">
        Alle Einträge
      </h1>
      <p className="text-[#633806] mb-8">Alle deine Changelog-Einträge</p>

      {products.length === 0 ? (
        <div className="text-[#854F0B]">
          <p>Keine Produkte gefunden</p>
        </div>
      ) : (
        <div className="space-y-8">
          {products.map((product) => (
            <div key={product.id}>
              <h2 className="text-xl font-medium text-[#2C2B28] mb-4">
                {product.name}
              </h2>

              {product.entries.length === 0 ? (
                <p className="text-[#854F0B]">Noch keine Einträge veröffentlicht</p>
              ) : (
                <div className="space-y-4">
                  {product.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-lg p-4 border"
                      style={{
                        backgroundColor: "#fef9ee",
                        borderColor: "#FAC775",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2 justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap"
                            style={{
                              backgroundColor: categoryColors[entry.category]?.bg || "#000",
                              color: categoryColors[entry.category]?.text || "#fff",
                            }}
                          >
                            {entry.category}
                          </span>
                          <h3 className="text-sm font-medium text-[#2C2B28]">
                            {entry.title}
                          </h3>
                        </div>
                        <Link
                          href={`/dashboard/entries/${entry.id}/edit`}
                          className="text-xs font-medium text-[#BA7517] hover:text-[#854F0B] transition whitespace-nowrap ml-2"
                        >
                          Bearbeiten
                        </Link>
                      </div>
                      <p className="text-xs text-[#633806] leading-relaxed mb-2 whitespace-pre-wrap">
                        {entry.body}
                      </p>
                      <p className="text-xs text-[#BA7517]">
                        {entry.publishedAt
                          ? new Date(entry.publishedAt).toLocaleDateString(
                              "de-DE",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "Kein Datum"}
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
