"use client";

import { useLocale, useTranslations } from "next-intl";

type EntrySection = {
  id: string;
  type: string;
  items: string;
};

type Entry = {
  id: string;
  title: string;
  version: string | null;
  publishedAt: Date | string | null;
  sections: EntrySection[];
};

type Props = {
  entries: Entry[];
};

const SECTION_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  feature:     { label: "Features",     icon: "✨", color: "bg-blue-100 text-blue-700" },
  fix:         { label: "Fixes",        icon: "🐛", color: "bg-red-100 text-red-700" },
  improvement: { label: "Improvements", icon: "⚡", color: "bg-amber-100 text-amber-700" },
  security:    { label: "Security",     icon: "🔒", color: "bg-green-100 text-green-700" },
  performance: { label: "Performance",  icon: "🚀", color: "bg-purple-100 text-purple-700" },
};

export default function EntriesList({ entries }: Props) {
  const t = useTranslations("changelog");
  const locale = useLocale();

  if (entries.length === 0) {
    return (
      <div style={{ color: "var(--text-mid)" }} className="text-center py-12 mb-12">
        <p>{t("noEntries")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-12">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="rounded-lg p-6 border"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-soft)" }}
        >
          <div className="flex items-baseline gap-2 mb-1">
            <h2 className="text-lg font-medium" style={{ color: "var(--text-dark)" }}>
              {entry.title}
            </h2>
            {entry.version && (
              <span className="text-sm" style={{ color: "var(--text-mid)" }}>
                v{entry.version}
              </span>
            )}
          </div>

          <div className="text-xs mb-4" style={{ color: "var(--primary)" }}>
            {entry.publishedAt
              ? new Date(entry.publishedAt).toLocaleDateString(locale, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : ""}
          </div>

          {entry.sections.map((section) => {
            const config = SECTION_CONFIG[section.type] ?? {
              label: section.type,
              icon: "•",
              color: "bg-zinc-100 text-zinc-700",
            };
            let items: string[] = [];
            try {
              items = JSON.parse(section.items);
            } catch {
              items = [];
            }
            if (items.length === 0) return null;
            return (
              <div key={section.id} className="mb-4">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full mb-2 ${config.color}`}
                >
                  {config.icon} {config.label}
                </span>
                <ul className="space-y-1 mt-1">
                  {items.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm pl-3 leading-relaxed"
                      style={{ color: "var(--text-dark)" }}
                    >
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
