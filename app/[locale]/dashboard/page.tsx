"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";

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
  const t = useTranslations("dashboard");
  const locale = useLocale();
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

        if (!productsRes.ok) throw new Error(t("loadingError"));
        const productData = (await productsRes.json()) as Array<{ id: string }>;
        if (productData.length > 0) setProductId(productData[0].id);

        if (!categoriesRes.ok) throw new Error(t("loadingError"));
        const categoryData = (await categoriesRes.json()) as Category[];
        const available = categoryData.filter((cat) => !cat.locked);
        setCategories(available);
        if (available.length > 0) setCategory(available[0].name);

        if (userRes.ok) setUserInfo(await userRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : t("loadingError"));
      }
    };

    fetchData();
  }, [t]);

  const handleImprove = async () => {
    if (!bullets.trim()) {
      setError(t("bulletPointsRequired"));
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

      if (!res.ok) throw new Error(t("loadingError"));
      const data = await res.json();
      setImproved(data.result);

      const userRes = await fetch("/api/user/me");
      if (userRes.ok) setUserInfo(await userRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loadingError"));
    } finally {
      setLoadingAI(false);
    }
  };

  const handlePublish = async () => {
    if (!improved.trim() || !title.trim()) {
      setError(t("titleAndEntryRequired"));
      return;
    }

    if (!productId) {
      setError(t("noProducts"));
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
        body: JSON.stringify({ title, body: improved, category, productId }),
      });

      if (res.status === 403) {
        const data = await res.json();
        if (data.error === "entry_limit_reached") {
          setLimitBanner("entry_limit_reached");
          return;
        }
      }

      if (!res.ok) throw new Error(t("loadingError"));

      setSuccess(t("publishSuccess"));

      setTimeout(() => {
        setBullets("");
        setImproved("");
        setTitle("");
        setCategory("New");
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loadingError"));
    } finally {
      setPublishing(false);
    }
  };

  const nextMonthFirst = (() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 1).toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
    });
  })();

  return (
    <div className="flex">
      <div className="w-3/5 px-8 py-8 border-r border-[var(--border-soft)]">
        <h1 className="text-3xl font-medium text-[var(--text-dark)] mb-8 font-[family-name:var(--font-display)]">
          {t("newEntry")}
        </h1>

        {limitBanner === "entry_limit_reached" && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg mb-6">
            <p className="text-sm text-amber-800">
              {t("entryLimit")}{" "}
              <a href="/dashboard/settings" className="underline font-medium">
                {t("upgradeToSolo")}
              </a>{" "}
              {t("forUnlimitedEntries")}
            </p>
          </div>
        )}
        {limitBanner === "ai_limit_reached" && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg mb-6">
            <p className="text-sm text-amber-800">
              {t("aiLimitMessage", { date: nextMonthFirst })}{" "}
              <a href="/dashboard/settings" className="underline font-medium">
                {t("upgradeToSolo")}
              </a>{" "}
              {t("forUnlimitedAI")}
            </p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text-dark)] mb-2">
            {t("bulletPoints")}
          </label>
          <textarea
            value={bullets}
            onChange={(e) => setBullets(e.target.value)}
            placeholder={`- Login-Fehler bei langen E-Mail-Adressen behoben\n- Performance des Widgets um 40% verbessert\n- Neues Kategorie-System eingeführt`}
            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg text-[var(--text-dark)] placeholder-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none min-h-[200px]"
          />
        </div>

        <div className="mb-6">
          <button
            onClick={handleImprove}
            disabled={loadingAI}
            className="w-full bg-[var(--primary)] hover:bg-[var(--text-mid)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition"
          >
            {loadingAI ? t("improving") : t("aiGenerate")}
          </button>
          {userInfo?.plan === "free" && userInfo.aiLimit !== null && (
            <p className="text-xs text-[var(--text-mid)] mt-1.5 text-right">
              {t("aiLimit", { used: userInfo.aiUsed, max: userInfo.aiLimit })}
            </p>
          )}
        </div>

        {improved && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--text-dark)] mb-2">
              {t("aiResult")}
            </label>
            <textarea
              value={improved}
              onChange={(e) => setImproved(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg text-[var(--text-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none min-h-[200px]"
            />
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text-dark)] mb-2">
            {t("titleLabel")}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("titlePlaceholder")}
            className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg text-[var(--text-dark)] placeholder-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text-dark)] mb-2">
            {t("category")}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg text-[var(--text-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.label}
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
          onClick={handlePublish}
          disabled={publishing || !improved || !title || !productId}
          className="w-full bg-[var(--primary)] hover:bg-[var(--text-mid)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition"
        >
          {publishing ? t("publishing") : t("publish")}
        </button>
      </div>

      <div className="w-2/5 bg-[var(--surface)] px-8 py-8">
        <p className="text-[11px] uppercase tracking-widest text-[var(--primary)] mb-6">
          {t("preview")}
        </p>

        {title && improved && (
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
            <p className="text-xs text-[var(--text-mid)] leading-relaxed whitespace-pre-wrap">{improved}</p>
            <p className="text-[11px] text-[var(--primary)] mt-3">
              {new Date().toLocaleDateString(locale, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}

        {(!title || !improved) && (
          <div className="text-center text-[var(--text-mid)] text-sm">
            <p>{t("fillPreview")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
