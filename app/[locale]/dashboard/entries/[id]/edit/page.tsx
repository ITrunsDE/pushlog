"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/lib/navigation";
import { useTranslations, useLocale } from "next-intl";

interface Category {
  name: string;
  label: string;
  color: string;
  locked?: boolean;
}

interface Entry {
  id: string;
  title: string;
  body: string;
  category: string;
  productId: string;
  publishedAt?: string;
}

export default function EditEntryPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();

  const [entry, setEntry] = useState<Entry | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const entryId = params.id as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [entryRes, categoriesRes] = await Promise.all([
          fetch(`/api/entries/${entryId}`),
          fetch("/api/categories"),
        ]);

        if (!entryRes.ok) {
          if (entryRes.status === 404) throw new Error(t("entryNotFound"));
          if (entryRes.status === 403) throw new Error(t("noPermission"));
          throw new Error(t("loadingError"));
        }

        const entryData = await entryRes.json();
        setEntry(entryData);
        setTitle(entryData.title);
        setBody(entryData.body);
        setCategory(entryData.category);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("loadingError"));
      } finally {
        setLoading(false);
      }
    };

    if (entryId) fetchData();
  }, [entryId, t]);

  const handleSave = async () => {
    if (!body.trim() || !title.trim()) {
      setError(t("titleAndEntryRequired"));
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/entries/${entryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, category }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("loadingError"));
      }

      setSuccess(t("publishSuccess"));
      setTimeout(() => {
        router.push("/dashboard/entries");
      }, 1500);
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

  return (
    <div className="flex">
      <div className="w-3/5 px-8 py-8 border-r border-[var(--border-soft)]">
        <h1 className="text-3xl font-medium text-[var(--text-dark)] mb-8 font-[family-name:var(--font-display)]">
          {t("editEntry")}
        </h1>

        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text-dark)] mb-2">{t("titleLabel")}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("titlePlaceholder")}
            className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg text-[var(--text-dark)] placeholder-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text-dark)] mb-2">{t("entryLabel")}</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg text-[var(--text-dark)] placeholder-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none min-h-[200px]"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text-dark)] mb-2">{t("category")}</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg text-[var(--text-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name} disabled={cat.locked && cat.name !== category}>
                {cat.locked ? `[Pro] ${cat.label}` : cat.label}
              </option>
            ))}
          </select>
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
          disabled={saving || !body || !title}
          className="w-full bg-[var(--primary)] hover:bg-[var(--text-mid)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition"
        >
          {saving ? t("saving") : t("save")}
        </button>
      </div>

      <div className="w-2/5 bg-[var(--surface)] px-8 py-8">
        <p className="text-[11px] uppercase tracking-widest text-[var(--primary)] mb-6">
          {t("preview")}
        </p>

        {title && body && (
          <div className="bg-[var(--background)] border border-[var(--border-soft)] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              {(() => {
                const selectedCategory = categories.find((cat) => cat.name === category);
                return selectedCategory ? (
                  <span
                    className="text-[10px] font-medium px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: selectedCategory.color, color: "#fff" }}
                  >
                    {selectedCategory.label}
                  </span>
                ) : null;
              })()}
              <span className="text-sm font-medium text-[var(--text-dark)]">{title}</span>
            </div>
            <p className="text-xs text-[var(--text-mid)] leading-relaxed whitespace-pre-wrap">{body}</p>
            <p className="text-[11px] text-[var(--primary)] mt-3">
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
          </div>
        )}

        {(!title || !body) && (
          <div className="text-center text-[var(--text-mid)] text-sm">
            <p>{t("fillPreview")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
