"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = "New" | "Fix" | "Improved" | "Removed";

const categoryColors: Record<Category, { bg: string; text: string; label: string }> = {
  New: { bg: "#085041", text: "#9FE1CB", label: "New" },
  Fix: { bg: "#FAEEDA", text: "#633806", label: "Fix" },
  Improved: { bg: "#085041", text: "#9FE1CB", label: "Improved" },
  Removed: { bg: "#FFE4E1", text: "#8B0000", label: "Removed" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [bullets, setBullets] = useState("");
  const [improved, setImproved] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("New");
  const [loadingAI, setLoadingAI] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImprove = async () => {
    if (!bullets.trim()) {
      setError("Bitte gib deine Bullet Points ein");
      return;
    }

    setLoadingAI(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullets }),
      });

      if (!res.ok) throw new Error("KI-Verbesserung fehlgeschlagen");
      const data = await res.json();
      setImproved(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setLoadingAI(false);
    }
  };

  const handlePublish = async () => {
    if (!improved.trim() || !title.trim()) {
      setError("Titel und Eintrag erforderlich");
      return;
    }

    setPublishing(true);
    setError(null);

    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body: improved,
          category,
        }),
      });

      if (!res.ok) throw new Error("Veröffentlichung fehlgeschlagen");

      // Reset form
      setBullets("");
      setImproved("");
      setTitle("");
      setCategory("New");

      // Redirect to entries list
      router.push("/dashboard/entries");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="flex">
      {/* Editor - 60% */}
      <div className="w-3/5 px-8 py-8 border-r border-[#FAC775]">
        <h1 className="text-3xl font-medium text-[#2C2B28] mb-8 font-[family-name:var(--font-display)]">
          Neuer Eintrag
        </h1>

        {/* Bullets Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#2C2B28] mb-2">
            Deine Bullet Points
          </label>
          <textarea
            value={bullets}
            onChange={(e) => setBullets(e.target.value)}
            placeholder={`- Login-Fehler bei langen E-Mail-Adressen behoben
- Performance des Widgets um 40% verbessert
- Neues Kategorie-System eingeführt`}
            className="w-full px-4 py-3 bg-[#fffdf8] border border-[#FAC775] rounded-lg text-[#2C2B28] placeholder-[#BA7517] focus:outline-none focus:ring-2 focus:ring-[#BA7517] resize-none min-h-[200px]"
          />
        </div>

        {/* AI Improve Button */}
        <button
          onClick={handleImprove}
          disabled={loadingAI}
          className="w-full bg-[#BA7517] hover:bg-[#9a6514] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition mb-6"
        >
          {loadingAI ? "Wird verbessert..." : "Mit KI verbessern ✦"}
        </button>

        {/* Improved Output */}
        {improved && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#2C2B28] mb-2">
              KI-Ergebnis
            </label>
            <textarea
              value={improved}
              onChange={(e) => setImproved(e.target.value)}
              className="w-full px-4 py-3 bg-[#fffdf8] border border-[#FAC775] rounded-lg text-[#2C2B28] focus:outline-none focus:ring-2 focus:ring-[#BA7517] resize-none min-h-[200px]"
            />
          </div>
        )}

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

        {/* Category Select */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#2C2B28] mb-2">
            Kategorie
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full px-4 py-2 bg-[#fffdf8] border border-[#FAC775] rounded-lg text-[#2C2B28] focus:outline-none focus:ring-2 focus:ring-[#BA7517]"
          >
            <option value="New">New</option>
            <option value="Fix">Fix</option>
            <option value="Improved">Improved</option>
            <option value="Removed">Removed</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Publish Button */}
        <button
          onClick={handlePublish}
          disabled={publishing || !improved || !title}
          className="w-full bg-[#BA7517] hover:bg-[#9a6514] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition"
        >
          {publishing ? "Wird veröffentlicht..." : "Veröffentlichen"}
        </button>
      </div>

      {/* Preview - 40% */}
      <div className="w-2/5 bg-[#fef9ee] px-8 py-8">
        <p className="text-[11px] uppercase tracking-widest text-[#BA7517] mb-6">
          Vorschau
        </p>

        {title && improved && (
          <div className="bg-[#fffdf8] border border-[#FAC775] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-[10px] font-medium px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: categoryColors[category].bg,
                  color: categoryColors[category].text,
                }}
              >
                {categoryColors[category].label}
              </span>
              <span className="text-sm font-medium text-[#2C2B28]">{title}</span>
            </div>
            <p className="text-xs text-[#633806] leading-relaxed whitespace-pre-wrap">
              {improved}
            </p>
            <p className="text-[11px] text-[#BA7517] mt-3">
              {new Date().toLocaleDateString("de-DE", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}

        {!title || !improved ? (
          <div className="text-center text-[#854F0B] text-sm">
            <p>Fülle den Titel und den Eintrag aus, um die Vorschau zu sehen</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
