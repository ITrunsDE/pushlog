"use client";

import { useState, useEffect } from "react";

interface Category {
  name: string;
  label: string;
  color: string;
  locked?: boolean;
}

interface UserInfo {
  plan: string;
  aiUsed: number;
  aiLimit: number | null;
}

export default function DashboardPage() {
  const [bullets, setBullets] = useState("");
  const [improved, setImproved] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [limitBanner, setLimitBanner] = useState<"entry_limit_reached" | "ai_limit_reached" | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, userRes] = await Promise.all([
          fetch("/api/products/me"),
          fetch("/api/categories"),
          fetch("/api/user/me"),
        ]);

        if (!productsRes.ok) throw new Error("Fehler beim Laden der Produkte");
        const productData = (await productsRes.json()) as Array<{ id: string }>;
        if (productData.length > 0) {
          setProductId(productData[0].id);
        }

        if (!categoriesRes.ok) throw new Error("Fehler beim Laden der Kategorien");
        const categoryData = (await categoriesRes.json()) as Category[];
        const availableCategories = categoryData.filter((cat) => !cat.locked);
        setCategories(availableCategories);
        if (availableCategories.length > 0) {
          setCategory(availableCategories[0].name);
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          setUserInfo(userData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Fehler beim Laden der Daten");
      }
    };

    fetchData();
  }, []);

  const handleImprove = async () => {
    if (!bullets.trim()) {
      setError("Bitte gib deine Bullet Points ein");
      return;
    }

    setLoadingAI(true);
    setError(null);
    setLimitBanner(null);

    try {
      const res = await fetch("/api/ai/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullets }),
      });

      if (res.status === 403) {
        const data = await res.json();
        if (data.error === "ai_limit_reached") {
          setLimitBanner("ai_limit_reached");
          return;
        }
      }

      if (!res.ok) throw new Error("KI-Verbesserung fehlgeschlagen");
      const data = await res.json();
      setImproved(data.result);

      // Refresh user info to update counter
      const userRes = await fetch("/api/user/me");
      if (userRes.ok) setUserInfo(await userRes.json());
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

    if (!productId) {
      setError("Produkt nicht gefunden");
      return;
    }

    setPublishing(true);
    setError(null);
    setSuccess(null);
    setLimitBanner(null);

    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body: improved,
          category,
          productId,
        }),
      });

      if (res.status === 403) {
        const data = await res.json();
        if (data.error === "entry_limit_reached") {
          setLimitBanner("entry_limit_reached");
          return;
        }
      }

      if (!res.ok) throw new Error("Veröffentlichung fehlgeschlagen");

      setSuccess("Eintrag erfolgreich veröffentlicht! ✓");

      // Reset form
      setTimeout(() => {
        setBullets("");
        setImproved("");
        setTitle("");
        setCategory("New");
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setPublishing(false);
    }
  };

  const nextMonthFirst = (() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 1).toLocaleDateString("de-DE", {
      day: "numeric",
      month: "long",
    });
  })();

  return (
    <div className="flex">
      {/* Editor - 60% */}
      <div className="w-3/5 px-8 py-8 border-r border-[#FAC775]">
        <h1 className="text-3xl font-medium text-[#2C2B28] mb-8 font-[family-name:var(--font-display)]">
          Neuer Eintrag
        </h1>

        {/* Limit banners */}
        {limitBanner === "entry_limit_reached" && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg mb-6">
            <p className="text-sm text-amber-800">
              You&apos;ve reached the 25 entry limit on the Free plan.{" "}
              <a href="/dashboard/settings" className="underline font-medium">
                Upgrade to Solo
              </a>{" "}
              for unlimited entries.
            </p>
          </div>
        )}
        {limitBanner === "ai_limit_reached" && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg mb-6">
            <p className="text-sm text-amber-800">
              You&apos;ve used all 5 AI generations for this month. Resets on {nextMonthFirst}.{" "}
              <a href="/dashboard/settings" className="underline font-medium">
                Upgrade to Solo
              </a>{" "}
              for unlimited AI generation.
            </p>
          </div>
        )}

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

        {/* AI Improve Button + counter */}
        <div className="mb-6">
          <button
            onClick={handleImprove}
            disabled={loadingAI}
            className="w-full bg-[#BA7517] hover:bg-[#9a6514] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition"
          >
            {loadingAI ? "Wird verbessert..." : "Mit KI verbessern ✦"}
          </button>
          {userInfo?.plan === "free" && userInfo.aiLimit !== null && (
            <p className="text-xs text-[#854F0B] mt-1.5 text-right">
              {userInfo.aiUsed} / {userInfo.aiLimit} AI generations used this month
            </p>
          )}
        </div>

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
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 bg-[#fffdf8] border border-[#FAC775] rounded-lg text-[#2C2B28] focus:outline-none focus:ring-2 focus:ring-[#BA7517]"
          >
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.label}
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

        {/* Publish Button */}
        <button
          onClick={handlePublish}
          disabled={publishing || !improved || !title || !productId}
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
