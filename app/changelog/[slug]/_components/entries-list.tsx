"use client";

import { useState } from "react";

const categoryColors: Record<string, { bg: string; text: string }> = {
  New: { bg: "#085041", text: "#9FE1CB" },
  Fix: { bg: "#FAEEDA", text: "#633806" },
  Improved: { bg: "#085041", text: "#9FE1CB" },
  Removed: { bg: "#FFE4E1", text: "#8B0000" },
};

type Entry = {
  id: string;
  title: string;
  body: string;
  category: string;
  publishedAt: Date | string | null;
};

type CustomCategory = {
  name: string;
  label: string;
};

type Props = {
  entries: Entry[];
  customCategories: CustomCategory[];
  isPro: boolean;
};

export default function EntriesList({ entries, customCategories, isPro }: Props) {
  const [activeTab, setActiveTab] = useState("all");

  const customCategoryNames = new Set(customCategories.map((c) => c.name));
  const usedCategories = [...new Set(entries.map((e) => e.category))];
  const showTabs = isPro && customCategories.length > 0;

  const standardTabs = usedCategories.filter((c) => !customCategoryNames.has(c));
  const customTabs = customCategories.filter((c) => usedCategories.includes(c.name));

  const filtered = activeTab === "all" ? entries : entries.filter((e) => e.category === activeTab);

  const tabStyle = (key: string) =>
    activeTab === key
      ? { backgroundColor: "#BA7517", color: "white" }
      : { border: "1px solid #FAC775", color: "#BA7517" };

  return (
    <div className="space-y-6 mb-12">
      {showTabs && (
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", ...standardTabs] as string[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className="px-3 py-1 rounded-full text-sm font-medium transition-colors"
              style={tabStyle(cat)}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
          {customTabs.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveTab(cat.name)}
              className="px-3 py-1 rounded-full text-sm font-medium transition-colors"
              style={tabStyle(cat.name)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ color: "#854F0B" }} className="text-center py-12">
          <p>Noch keine Einträge veröffentlicht</p>
        </div>
      ) : (
        filtered.map((entry) => (
          <div
            key={entry.id}
            className="rounded-lg p-6 border"
            style={{ backgroundColor: "#fef9ee", borderColor: "#FAC775" }}
          >
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
              <h2 className="text-lg font-medium flex-1" style={{ color: "#412402" }}>
                {entry.title}
              </h2>
            </div>

            <div
              className="text-sm leading-relaxed whitespace-pre-wrap mb-4"
              style={{ color: "#412402" }}
            >
              {entry.body}
            </div>

            <div className="text-xs" style={{ color: "#BA7517" }}>
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
  );
}
