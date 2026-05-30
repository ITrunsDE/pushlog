"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/lib/navigation";
import { useTranslations, useLocale } from "next-intl";

type Section = { type: string; items: string[] };

interface UserInfo {
  plan: string;
  aiUsed: number;
  aiLimit: number | null;
}

interface CustomCategory {
  id: string;
  name: string;
  label: string;
  icon?: string;
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

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();

  const [bulletPoints, setBulletPoints] = useState("");
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [productLocked, setProductLocked] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [limitBanner, setLimitBanner] = useState<"entry_limit_reached" | "ai_limit_reached" | null>(null);

  const isPro = userInfo?.plan === "pro";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activeRes, categoriesRes, userRes] = await Promise.all([
          fetch("/api/products/active"),
          fetch("/api/categories"),
          fetch("/api/user/me"),
        ]);

        if (activeRes.ok) {
          const productData = (await activeRes.json()) as { id: string; isActive: boolean };
          setProductId(productData.id);
          setProductLocked(productData.isActive === false);
        } else {
          // Fallback for new users: auto-create via /api/products/me
          const meRes = await fetch("/api/products/me");
          if (meRes.ok) {
            const productData = (await meRes.json()) as Array<{ id: string }>;
            if (productData.length > 0) setProductId(productData[0].id);
          }
        }

        if (categoriesRes.ok) {
          const catData = await categoriesRes.json();
          setCustomCategories(catData.filter((c: { isCustom?: boolean; locked?: boolean }) => c.isCustom && !c.locked));
        }

        if (userRes.ok) setUserInfo(await userRes.json());
      } catch {
        setError(t("loadingError"));
      }
    };
    fetchData();
  }, [t]);

  const handleStructureWithAI = async () => {
    if (!bulletPoints.trim()) {
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
        body: JSON.stringify({ bullets: bulletPoints }),
      });

      if (res.status === 403) {
        const data = await res.json();
        if (data.error === "ai_limit_reached") {
          setLimitBanner("ai_limit_reached");
          const userRes = await fetch("/api/user/me");
          if (userRes.ok) setUserInfo(await userRes.json());
          return;
        }
      }

      if (!res.ok) throw new Error(t("loadingError"));
      const data = await res.json();
      const aiResult = data.result;

      if (aiResult.title) setTitle(aiResult.title);
      if (aiResult.version) setVersion(aiResult.version || "");
      if (Array.isArray(aiResult.sections)) setSections(aiResult.sections);

      const userRes = await fetch("/api/user/me");
      if (userRes.ok) setUserInfo(await userRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loadingError"));
    } finally {
      setLoadingAI(false);
    }
  };

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

  const handlePublish = async () => {
    if (!title.trim()) {
      setError(t("titleAndEntryRequired"));
      return;
    }

    const validSections = sections.filter((s) => s.items.some((i) => i.trim()));
    if (validSections.length === 0) {
      setError(t("sectionRequired"));
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
        body: JSON.stringify({
          title,
          version: version || null,
          sections: validSections.map((s) => ({
            ...s,
            items: s.items.filter((i) => i.trim()),
          })),
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

      if (!res.ok) throw new Error(t("loadingError"));

      setSuccess(t("publishSuccess"));
      router.refresh();
      router.push("/dashboard/entries");
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

  const aiLimitReached =
    userInfo?.plan === "free" &&
    userInfo.aiLimit !== null &&
    userInfo.aiUsed >= userInfo.aiLimit;
  const canPublish =
    !!title.trim() &&
    sections.some((s) => s.items.some((i) => i.trim())) &&
    !!productId;

  return (
    <div className="flex min-h-screen">
      <div className="w-3/5 px-8 py-8 border-r border-[var(--border-soft)]">
        <h1 className="text-3xl font-medium text-[var(--text-dark)] mb-8 font-[family-name:var(--font-display)]">
          {t("newEntry")}
        </h1>

        {productLocked && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
            <p className="text-sm text-red-700">{t("productLocked")}</p>
          </div>
        )}

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

        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--text-dark)] mb-2">
            {t("bulletPoints")}
          </label>
          <textarea
            value={bulletPoints}
            onChange={(e) => setBulletPoints(e.target.value)}
            placeholder={t("bulletPointsPlaceholder")}
            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg text-[var(--text-dark)] placeholder-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none min-h-[120px]"
          />
        </div>

        <div className="mb-8">
          <button
            onClick={handleStructureWithAI}
            disabled={loadingAI || !!aiLimitReached}
            title={aiLimitReached ? t("aiLimitTitle", { date: nextMonthFirst }) : undefined}
            className="w-full bg-[var(--primary)] hover:bg-[var(--text-mid)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--background)] font-medium py-2.5 rounded-lg transition"
          >
            {loadingAI ? t("improving") : t("aiGenerate")}
          </button>
          {userInfo?.plan === "free" && (
            <p className="text-xs text-[var(--text-mid)] mt-1.5 text-right">
              {t("aiLimit", { used: userInfo.aiUsed, max: userInfo.aiLimit ?? 0 })}
            </p>
          )}
        </div>

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
                          {c.icon ? `${c.icon} ${c.label}` : c.label}
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
          onClick={handlePublish}
          disabled={publishing || !canPublish}
          className="w-full bg-[var(--primary)] hover:bg-[var(--text-mid)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--background)] font-medium py-2.5 rounded-lg transition"
        >
          {publishing ? t("publishing") : t("publish")}
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
              {new Date().toLocaleDateString(locale, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            {sections.map((section, i) => {
              const custom = customCategories.find((c) => c.name === section.type);
              const config = SECTION_CONFIG[section.type] ?? (
                custom
                  ? { label: custom.label, icon: custom.icon ?? "📌", color: "bg-zinc-100 text-zinc-700" }
                  : { label: section.type, icon: "•", color: "bg-zinc-100 text-zinc-700" }
              );
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
