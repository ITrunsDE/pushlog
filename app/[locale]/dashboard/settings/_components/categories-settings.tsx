"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

interface Category {
  name: string;
  label: string;
  color: string;
  icon?: string;
  isCustom?: boolean;
  id?: string;
  locked?: boolean;
}

interface CategoriesSettingsProps {
  plan: string;
}

const STANDARD_CATEGORIES: Category[] = [
  { name: "feature", label: "Feature", color: "#BA7517" },
  { name: "fix", label: "Fix", color: "#ef4444" },
  { name: "improvement", label: "Improvement", color: "#3b82f6" },
  { name: "security", label: "Security", color: "#22c55e" },
];

const EMOJI_SUGGESTIONS = [
  "🚀", "✨", "🐛", "⚡", "🔒", "🎨", "📦", "🔧", "💡", "🌟", "🔥", "💎",
];

export function CategoriesSettings({ plan }: CategoriesSettingsProps) {
  const [categories, setCategories] = useState<Category[]>(STANDARD_CATEGORIES);
  const [newCategory, setNewCategory] = useState({ name: "", label: "", color: "#BA7517", icon: "📌" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isPro = plan === "pro";

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPro) return;

    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create category");
      }

      setNewCategory({ name: "", label: "", color: "#BA7517", icon: "📌" });
      setSuccess("Category added successfully");
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!isPro) return;

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete category");

      setSuccess("Category deleted successfully");
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  const customCategories = categories.filter((cat) => cat.isCustom);
  const customCount = customCategories.length;
  const lockedCount = categories.filter((cat) => cat.locked).length;

  return (
    <div className="border-t border-[var(--border-soft)] pt-8 mt-8">
      <h2 className="text-lg font-semibold text-[var(--text-dark)] mb-2">Kategorien</h2>

      {!isPro && lockedCount > 0 && (
        <div className="mb-6 p-4 bg-[var(--surface)] border border-[var(--border-soft)] rounded-lg">
          <p className="text-sm text-[var(--text-mid)] mb-3">
            You have {lockedCount} custom {lockedCount === 1 ? "category" : "categories"} from your Pro plan. Upgrade to Pro to use them again.
          </p>
          <a
            href="/pricing"
            className="inline-block px-4 py-2 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--text-mid)] transition-colors"
          >
            Upgrade to Pro
          </a>
        </div>
      )}

      {!isPro && lockedCount === 0 && (
        <div className="mb-6 p-4 bg-[var(--surface)] border border-[var(--border-soft)] rounded-lg">
          <p className="text-sm text-[var(--text-mid)] mb-3">
            Eigene Kategorien sind ein Pro-Feature. Upgrade auf Pro, um benutzerdefinierte
            Kategorien zu erstellen.
          </p>
          <a
            href="/pricing"
            className="inline-block px-4 py-2 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--text-mid)] transition-colors"
          >
            Upgrade auf Pro
          </a>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <p className="text-sm text-[var(--text-mid)]">
          {isPro
            ? `Standard-Kategorien (keine Änderungen) + ${customCount} von 10 benutzerdefinierten Kategorien`
            : "Standard-Kategorien"}
        </p>

        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={`${cat.name}-${cat.isCustom ? cat.id : "std"}`}
              className={`flex items-center gap-3 p-3 rounded-lg ${cat.locked ? "bg-[var(--surface)] opacity-60" : "bg-gray-50"}`}
            >
              <div className="w-4 h-4 rounded" style={{ backgroundColor: cat.color }} />
              <div className="flex-1">
                <span className="text-sm font-medium text-[var(--text-dark)]">
                  {cat.icon && cat.isCustom ? `${cat.icon} ` : ""}{cat.label}
                </span>
                {!cat.isCustom && (
                  <span className="ml-2 text-xs text-[var(--text-mid)]">(Standard)</span>
                )}
                {cat.locked && (
                  <span className="ml-2 text-xs text-[var(--primary)]">(Pro)</span>
                )}
              </div>
              {isPro && cat.isCustom && (
                <button
                  onClick={() => cat.id && handleDeleteCategory(cat.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {isPro && (
        <form onSubmit={handleAddCategory} className="p-4 bg-[var(--surface)] border border-[var(--border-soft)] rounded-lg">
          <h3 className="text-sm font-semibold text-[var(--text-dark)] mb-4">Neue Kategorie hinzufügen</h3>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-mid)] mb-1">
                Icon
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  maxLength={2}
                  className="w-16 text-center text-2xl rounded-lg border border-[var(--border-soft)] p-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="📌"
                />
                <div className="flex flex-wrap gap-1">
                  {EMOJI_SUGGESTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewCategory({ ...newCategory, icon: emoji })}
                      className={`rounded p-1 text-lg hover:bg-zinc-100 transition-colors ${newCategory.icon === emoji ? "bg-zinc-100 ring-1 ring-zinc-300" : ""}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-mid)] mb-1">
                Name (z.B. "breaking")
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="breaking"
                className="w-full px-3 py-2 text-sm border border-[var(--border-soft)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-mid)] mb-1">
                Label (z.B. "Breaking Change")
              </label>
              <input
                type="text"
                value={newCategory.label}
                onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                placeholder="Breaking Change"
                className="w-full px-3 py-2 text-sm border border-[var(--border-soft)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-mid)] mb-1">
                Farbe
              </label>
              <input
                type="color"
                value={newCategory.color}
                onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                className="w-12 h-10 rounded-lg border border-[var(--border-soft)] cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || customCount >= 10}
              className="w-full px-4 py-2 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--text-mid)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Wird hinzugefügt..." : "Kategorie hinzufügen"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
