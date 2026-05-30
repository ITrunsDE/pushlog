"use client";

import { useState } from "react";
import { useRouter } from "@/lib/navigation";
import type { Product } from "@prisma/client";
import { useTranslations } from "next-intl";

interface ProductSettingsProps {
  product: Product;
}

export default function ProductSettings({ product }: ProductSettingsProps) {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [widgetColor, setWidgetColor] = useState(product.widgetColor || "#BA7517");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toLowerCase();
    value = value.replace(/\s+/g, "-");
    setSlug(value);
  };

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) {
      setError(t("nameSlugRequired"));
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
        throw new Error(data.error || t("genericError"));
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("genericError"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === "last_product") {
          setDeleteError(t("lastProductError"));
        } else {
          setDeleteError(data.error || t("deleteError"));
        }
        setShowDeleteDialog(false);
        return;
      }

      await fetch("/api/products/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: null }),
      });

      router.push("/dashboard");
      router.refresh();
    } catch {
      setDeleteError(t("unexpectedError"));
      setShowDeleteDialog(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div
        className="rounded-lg p-6 border"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-soft)" }}
      >
        <h2 className="text-xl font-medium text-[var(--text-dark)] mb-6">
          {t("productSettingsTitle")}
        </h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text-dark)] mb-2">
            {t("productName")}
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
              {t("slugChangeNotice", { slug })}
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
            {t("widgetColor")}
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
            <p className="text-sm text-green-700">{t("savedSuccess")}</p>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[var(--primary)] hover:bg-[var(--text-mid)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition"
        >
          {saving ? t("saving") : t("save")}
        </button>
      </div>

      <div className="mt-6 rounded-lg border border-red-200 p-6">
        <h3 className="text-sm font-semibold text-red-700">{t("dangerZone")}</h3>
        <p className="mt-1 text-sm text-red-600">{t("deleteProductWarning")}</p>
        {deleteError && (
          <p className="mt-2 text-sm text-red-700 font-medium">{deleteError}</p>
        )}
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
        >
          {t("deleteProduct")}
        </button>
      </div>

      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="rounded-xl p-6 shadow-xl max-w-sm w-full mx-4"
            style={{ backgroundColor: "var(--surface)" }}
          >
            <h3 className="font-semibold" style={{ color: "var(--text-dark)" }}>
              {t("deleteProductConfirmTitle")}
            </h3>
            <p className="mt-2 text-sm" style={{ color: "var(--text-mid)" }}>
              {t("deleteProductConfirmBody")}
            </p>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
                className="rounded-lg border px-4 py-2 text-sm transition-colors"
                style={{ borderColor: "var(--border-soft)", color: "var(--text-mid)" }}
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
              >
                {deleting ? t("deleting") : t("deleteConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
