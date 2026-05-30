"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/lib/navigation";
import { useTranslations, useLocale } from "next-intl";

type Section = { type: string; items: string[] };

interface EntrySection {
  id: string;
  type: string;
  items: string;
}

interface Entry {
  id: string;
  title: string;
  version: string | null;
  productId: string;
  publishedAt?: string;
  sections: EntrySection[];
}

interface CustomCategory {
  id: string;
  name: string;
  label: string;
}

const STANDARD_TYPES = [
  { value: "feature", label: "✨ Feature" },
  { value: "fix", label: "🐛 Fix" },
  { value: "improvement", label: "⚡ Improvement" },
  { value: "security", label: "🔒 Security" },
  { value: "performance", label: "🚀 Performance" },
];

const SECTION_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  feature:     { label: "Features",     icon: "✨", color: "bg-blue-100 text-blue-700" },
  fix:         { label: "Fixes",        icon: "🐛", color: "bg-red-100 text-red-700" },
  improvement: { label: "Improvements", icon: "⚡", color: "bg-amber-100 text-amber-700" },
  security:    { label: "Security",     icon: "🔒", color: "bg-green-100 text-green-700" },
  performance: { label: "Performance",  icon: "🚀", color: "bg-purple-100 text-purple-700" },
};

export default function EditEntryPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();

  const [entry, setEntry] = useState<Entry | null>(null);
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const entryId = params.id as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [entryRes, categoriesRes, userRes] = await Promise.all([
          fetch(`/api/entries/${entryId}`),
          fetch("/api/categories"),
          fetch("/api/user/me"),
        ]);

        if (!entryRes.ok) {
          if (entryRes.status === 404) throw new Error(t("entryNotFound"));
          if (entryRes.status === 403) throw new Error(t("noPermission"));
          throw new Error(t("loadingError"));
        }

        const entryData: Entry = await entryRes.json();
        setEntry(entryData);
        setTitle(entryData.title);
        setVersion(entryData.version ?? "");
        setSections(
          entryData.sections.map((s) => ({
            type: s.type,
            items: JSON.parse(s.items) as string[],
          }))
        );

        if (categoriesRes.ok) {
          const catData = await categoriesRes.json();
          setCustomCategories(
            catData.filter((c: { isCustom?: boolean; locked?: boolean }) => c.isCustom && !c.locked)
          );
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          setIsPro(userData.plan === "pro");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("loadingError"));
      } finally {
        setLoading(false);
      }
    };

    if (entryId) fetchData();
  }, [entryId, t]);

  const addSection = () =>
    setSections((prev) => [...prev, { type: "feature", items: [""] }]);

  const removeSection = (i: number) =>
    setSections((prev) => prev.filter((_, idx) => idx !== i));

  const updateSectionType = (i: number, type: string) =>
    setSections((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, type } : s))
    );

  const addItem = (i: number) =>
    setSections((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, items: [...s.items, ""] } : s))
    );

  const updateItem = (i: number, j: number, value: string) =>
    setSections((prev) =>
      prev.map((s, idx) =>
        idx === i
          ? { ...s, items: s.items.map((item, jdx) => (jdx === j ? value : item)) }
          : s
      )
    );

  const removeItem = (i: number, j: number) =>
    setSections((prev) =>
      prev.map((s, idx) =>
        idx === i ? { ...s, items: s.items.filter((_, jdx) => jdx !== j) } : s
      )
    );

  const handleSave = async () => {
    if (!title.trim()) {
      setError(t("titleAndEntryRequired"));
      return;
    }

    const validSections = sections.filter((s) => s.items.some((i) => i.trim()));
    if (validSections.length === 0) {
      setError(t("sectionRequired"));
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/entries/${entryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          version: version || null,
          sections: validSections.map((s) => ({
            ...s,
            items: s.items.filter((i) => i.trim()),
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("loadingError"));
      }

      setSuccess(t("publishSuccess"));
      router.refresh();
      router.push("/dashboard/entries");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loadingError"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[var(--text-dark)]">{t("loadingData")}</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">{error || t("entryNotFound")}</p>
      </div>
    );
  }

  const canSave =
    !!title.trim() && sections.some((s) => s.items.some((i) => i.trim()));

  return (
    <div className="flex">
      <div className="w-3/5 px-8 py-8 border-r border-[var(--border-soft)]">
        <h1 className="text-3xl font-medium text-[var(--text-dark)] mb-8 font-[family-name:var(--font-display)]">
          {t("editEntry")}
        </h1>

        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text-dark)] mb-2">
            {t("titleLabel")} *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("titlePlaceholder")}
            className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg text-[var(--text-dark)] placeholder-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-[var(--text-dark)] mb-2">
            Version (optional)
          </label>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder={t("versionPlaceholder")}
            className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg text-[var(--text-dark)] placeholder-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text-dark)] mb-3">
            {t("sections")}
          </label>
          <div className="space-y-4">
            {sections.map((section, i) => (
              <div
                key={i}
                className="p-4 bg-[var(--surface)] border border-[var(--border-soft)] rounded-lg"
              >
                <div className="flex items-center gap-3 mb-3">
                  <select
                    value={section.type}
                    onChange={(e) => updateSectionType(i, e.target.value)}
                    className="px-3 py-1.5 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg text-[var(--text-dark)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    {STANDARD_TYPES.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                    {isPro &&
                      customCategories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.label}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={() => removeSection(i)}
                    className="ml-auto text-xs text-red-500 hover:text-red-700 transition"
                  >
                    {t("removeSection")}
                  </button>
                </div>
                <div className="space-y-2">
                  {section.items.map((item, j) => (
                    <div key={j} className="flex gap-2">
                      <input
                        value={item}
                        onChange={(e) => updateItem(i, j, e.target.value)}
                        placeholder={t("itemPlaceholder")}
                        className="flex-1 px-3 py-1.5 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg text-[var(--text-dark)] text-sm placeholder-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                      <button
                        onClick={() => removeItem(i, j)}
                        className="text-[var(--text-mid)] hover:text-red-500 transition text-lg leading-none px-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => addItem(i)}
                  className="mt-2 text-xs text-[var(--primary)] hover:text-[var(--text-mid)] transition"
                >
                  + Item
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addSection}
            className="mt-3 w-full py-2 border border-dashed border-[var(--border-soft)] rounded-lg text-sm text-[var(--text-mid)] hover:text-[var(--text-dark)] hover:border-[var(--primary)] transition"
          >
            {t("addSection")}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-6">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !canSave}
          className="w-full bg-[var(--primary)] hover:bg-[var(--text-mid)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition"
        >
          {saving ? t("saving") : t("save")}
        </button>
      </div>

      <div className="w-2/5 bg-[var(--surface)] px-8 py-8">
        <p className="text-[11px] uppercase tracking-widest text-[var(--primary)] mb-6">
          {t("preview")}
        </p>

        {title || sections.length > 0 ? (
          <div className="bg-[var(--background)] border border-[var(--border-soft)] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-[var(--text-dark)]">
                {title || "..."}
              </span>
              {version && (
                <span className="text-xs text-[var(--text-mid)]">v{version}</span>
              )}
            </div>
            <p className="text-[11px] text-[var(--primary)] mb-4">
              {entry?.publishedAt
                ? new Date(entry.publishedAt).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : new Date().toLocaleDateString(locale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
            </p>
            {sections.map((section, i) => {
              const config = SECTION_CONFIG[section.type] ?? {
                label: section.type,
                icon: "•",
                color: "bg-zinc-100 text-zinc-700",
              };
              const items = section.items.filter((item) => item.trim());
              if (items.length === 0) return null;
              return (
                <div key={i} className="mb-3">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full mb-1.5 ${config.color}`}
                  >
                    {config.icon} {config.label}
                  </span>
                  <ul className="space-y-0.5">
                    {items.map((item, j) => (
                      <li key={j} className="text-xs text-[var(--text-dark)] pl-3">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-[var(--text-mid)] text-sm">
            <p>{t("fillPreview")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
