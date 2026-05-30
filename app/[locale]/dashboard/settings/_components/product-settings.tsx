"use client";

import { useState } from "react";
import type { Product } from "@prisma/client";

interface ProductSettingsProps {
  product: Product;
}

export default function ProductSettings({ product }: ProductSettingsProps) {
  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [widgetColor, setWidgetColor] = useState(product.widgetColor || "#BA7517");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toLowerCase();
    value = value.replace(/\s+/g, "-");
    setSlug(value);
  };

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) {
      setError("Name und Slug erforderlich");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, widgetColor }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fehler beim Speichern");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="rounded-lg p-6 border"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-soft)" }}
    >
      <h2 className="text-xl font-medium text-[var(--text-dark)] mb-6">
        Produkt-Einstellungen
      </h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--text-dark)] mb-2">
          Produktname
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg text-[var(--text-dark)] placeholder-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--text-dark)] mb-2">
          Slug
          <span className="block text-xs text-[var(--text-mid)] font-normal mt-1">
            Ändert die öffentliche URL zu /changelog/{slug}
          </span>
        </label>
        <input
          type="text"
          value={slug}
          onChange={handleSlugChange}
          className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg text-[var(--text-dark)] placeholder-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-mono"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--text-dark)] mb-2">
          Widget-Farbe
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={widgetColor}
            onChange={(e) => setWidgetColor(e.target.value)}
            className="h-10 w-20 rounded-lg cursor-pointer border border-[var(--border-soft)]"
          />
          <input
            type="text"
            value={widgetColor}
            onChange={(e) => setWidgetColor(e.target.value)}
            className="flex-1 px-4 py-2 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg text-[var(--text-dark)] placeholder-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-mono"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-6">
          <p className="text-sm text-green-700">Gespeichert ✓</p>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-[var(--primary)] hover:bg-[var(--text-mid)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition"
      >
        {saving ? "Wird gespeichert..." : "Speichern"}
      </button>
    </div>
  );
}
