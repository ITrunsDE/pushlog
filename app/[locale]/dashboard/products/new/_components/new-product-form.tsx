"use client";

import { useState } from "react";
import { useRouter } from "@/lib/navigation";

export function NewProductForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(
          data.error === "upgrade_required"
            ? "Mehrere Produkte sind nur im Pro-Plan verfügbar."
            : data.error || "Fehler beim Erstellen des Produkts"
        );
        return;
      }

      const product = await res.json();

      await fetch("/api/products/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--text-dark)] mb-2">
          Produktname
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z.B. My App"
          className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg text-[var(--text-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          required
          maxLength={50}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="w-full py-2.5 bg-[var(--primary)] hover:bg-[var(--text-mid)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
      >
        {loading ? "Wird erstellt..." : "Produkt erstellen"}
      </button>
    </form>
  );
}
