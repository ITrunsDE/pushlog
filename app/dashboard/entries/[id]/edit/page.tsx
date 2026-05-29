"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

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
          if (entryRes.status === 404) {
            throw new Error("Eintrag nicht gefunden");
          } else if (entryRes.status === 403) {
            throw new Error("Du hast keine Berechtigung, diesen Eintrag zu bearbeiten");
          }
          throw new Error("Fehler beim Laden des Eintrags");
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
        setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
      } finally {
        setLoading(false);
      }
    };

    if (entryId) {
      fetchData();
    }
  }, [entryId]);

  const handleSave = async () => {
    if (!body.trim() || !title.trim()) {
      setError("Titel und Eintrag erforderlich");
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
          body,
          category,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fehler beim Speichern");
      }

      setSuccess("Eintrag erfolgreich aktualisiert! ✓");
      setTimeout(() => {
        router.push("/dashboard/entries");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#2C2B28]">Wird geladen...</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">{error || "Eintrag nicht gefunden"}</p>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Editor - 60% */}
      <div className="w-3/5 px-8 py-8 border-r border-[#FAC775]">
        <h1 className="text-3xl font-medium text-[#2C2B28] mb-8 font-[family-name:var(--font-display)]">
          Eintrag bearbeiten
        </h1>

        {/* Title Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#2C2B28] mb-2">
            Titel
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z.B. KI-Assistent für Changelogs"
            className="w-full px-4 py-2 bg-[#fffdf8] border border-[#FAC775] rounded-lg text-[#2C2B28] placeholder-[#BA7517] focus:outline-none focus:ring-2 focus:ring-[#BA7517]"
          />
        </div>

        {/* Body Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#2C2B28] mb-2">
            Eintrag
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Beschreibe deine Änderungen..."
            className="w-full px-4 py-3 bg-[#fffdf8] border border-[#FAC775] rounded-lg text-[#2C2B28] placeholder-[#BA7517] focus:outline-none focus:ring-2 focus:ring-[#BA7517] resize-none min-h-[200px]"
          />
        </div>

        {/* Category Select */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#2C2B28] mb-2">
            Kategorie
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 bg-[#fffdf8] border border-[#FAC775] rounded-lg text-[#2C2B28] focus:outline-none focus:ring-2 focus:ring-[#BA7517]"
          >
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name} disabled={cat.locked && cat.name !== category}>
                {cat.locked ? `[Pro] ${cat.label}` : cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-6">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || !body || !title}
          className="w-full bg-[#BA7517] hover:bg-[#9a6514] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition"
        >
          {saving ? "Wird gespeichert..." : "Speichern"}
        </button>
      </div>

      {/* Preview - 40% */}
      <div className="w-2/5 bg-[#fef9ee] px-8 py-8">
        <p className="text-[11px] uppercase tracking-widest text-[#BA7517] mb-6">
          Vorschau
        </p>

        {title && body && (
          <div className="bg-[#fffdf8] border border-[#FAC775] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              {(() => {
                const selectedCategory = categories.find((cat) => cat.name === category);
                return selectedCategory ? (
                  <span
                    className="text-[10px] font-medium px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: selectedCategory.color,
                      color: "#fff",
                    }}
                  >
                    {selectedCategory.label}
                  </span>
                ) : null;
              })()}
              <span className="text-sm font-medium text-[#2C2B28]">{title}</span>
            </div>
            <p className="text-xs text-[#633806] leading-relaxed whitespace-pre-wrap">
              {body}
            </p>
            <p className="text-[11px] text-[#BA7517] mt-3">
              {entry?.publishedAt
                ? new Date(entry.publishedAt).toLocaleDateString("de-DE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : new Date().toLocaleDateString("de-DE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
            </p>
          </div>
        )}

        {!title || !body ? (
          <div className="text-center text-[#854F0B] text-sm">
            <p>Fülle den Titel und den Eintrag aus, um die Vorschau zu sehen</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
