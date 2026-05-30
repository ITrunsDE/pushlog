"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

declare global {
  interface Window {
    __pushlogFreeLoaded?: boolean;
    __pushlogProLoaded?: boolean;
  }
}

type Tab = "popup" | "inline";

export function WidgetClient({ slug, userPlan = "free" }: { slug: string | null; userPlan?: string }) {
  const t = useTranslations("dashboard");
  const [activeTab, setActiveTab] = useState<Tab>("popup");
  const [copied, setCopied] = useState(false);
  const [freeLoaded, setFreeLoaded] = useState(false);
  const [proCopied, setProCopied] = useState(false);
  const [proLoaded, setProLoaded] = useState(false);
  const isPro = userPlan === "pro";

  const freeScriptTag = slug
    ? `<script src="https://pushlog.io/widget.js" data-product="${slug}"><\/script>`
    : "";

  const proScriptTag = slug
    ? `<script src="https://pushlog.io/widget-pro.js" data-product="${slug}" data-style="popup" data-position="bottom-right" data-limit="5" data-category="feature"><\/script>`
    : "";

  const inlineSnippet = slug
    ? `<div id="my-changelog"></div>\n<script src="https://pushlog.io/widget-pro.js" data-product="${slug}" data-style="inline" data-target="#my-changelog" data-limit="3"><\/script>`
    : "";

  const handleCopyCode = async () => {
    if (!freeScriptTag) return;
    try {
      await navigator.clipboard.writeText(freeScriptTag);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleLoadFreePreview = () => {
    if (!slug) return;

    if (freeLoaded) {
      delete window.__pushlogFreeLoaded;
      const existingScript = document.querySelector(
        'script[src*="widget.js"]:not([src*="widget-pro"])'
      );
      if (existingScript) existingScript.remove();

      const button = document.querySelector(".pushlog-button");
      if (button) button.remove();
      const popup = document.querySelector(".pushlog-popup");
      if (popup) popup.remove();
      const overlay = document.querySelector(".pushlog-overlay");
      if (overlay) overlay.remove();

      setFreeLoaded(false);
      return;
    }

    const script = document.createElement("script");
    const host = typeof window !== "undefined" ? window.location.origin : "https://pushlog.io";
    script.src = `${host}/widget.js`;
    script.setAttribute("data-product", slug);
    document.body.appendChild(script);

    setFreeLoaded(true);
  };

  const handleCopyProCode = async () => {
    if (!proScriptTag) return;
    try {
      await navigator.clipboard.writeText(proScriptTag);
      setProCopied(true);
      setTimeout(() => setProCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleLoadProPreview = () => {
    if (!slug) return;

    if (proLoaded) {
      delete window.__pushlogProLoaded;
      const existingScript = document.querySelector('script[src*="widget-pro.js"]');
      if (existingScript) existingScript.remove();

      const target = document.getElementById("pushlog-pro-preview");
      if (target) {
        target.innerHTML = "";
        target.removeAttribute("data-pushlog-loaded");
      }

      setProLoaded(false);
      return;
    }

    setTimeout(() => {
      const targetDiv = document.getElementById("pushlog-pro-preview");
      if (!targetDiv) {
        console.error("[Pushlog Widget Pro] Target div not found");
        return;
      }

      const script = document.createElement("script");
      const host = typeof window !== "undefined" ? window.location.origin : "https://pushlog.io";
      script.src = `${host}/widget-pro.js`;
      script.setAttribute("data-product", slug);
      script.setAttribute("data-style", "inline");
      script.setAttribute("data-target", "#pushlog-pro-preview");
      script.setAttribute("data-limit", "5");
      document.head.appendChild(script);

      setProLoaded(true);
    }, 0);
  };

  if (!slug) {
    return (
      <div className="px-8 py-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{t("noProductFound")}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "popup" as Tab, label: "Popup Widget" },
    { id: "inline" as Tab, label: "Inline Snippet" },
  ];

  return (
    <div className="px-8 py-8 max-w-2xl">
      <h1 className="text-3xl font-medium text-[var(--text-dark)] mb-2 font-[family-name:var(--font-display)]">
        {t("widgetTitle")}
      </h1>
      <p className="text-[var(--text-mid)] text-sm mb-8">
        {t("widgetSubtitle")}
      </p>

      <div className="flex gap-1 border-b mb-6" style={{ borderColor: "var(--border-soft)" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id ? "border-[var(--primary)]" : "border-transparent"
            }`}
            style={{ color: activeTab === tab.id ? "var(--primary)" : "var(--text-mid)" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "popup" && (
        <div className="space-y-6">
          <div>
            <p className="text-sm text-[var(--text-mid)] mb-4">
              {t("widgetCopyInstructions")}
            </p>

            <div className="bg-[var(--surface)] border border-[var(--border-soft)] rounded-lg p-4 mb-3">
              <div className="relative pr-20">
                <code className="text-[var(--text-dark)] text-sm font-mono block break-all">
                  {freeScriptTag}
                </code>
                <button
                  onClick={handleCopyCode}
                  className="absolute top-0 right-0 px-3 py-1.5 bg-[var(--primary)] hover:bg-[var(--text-mid)] text-white text-xs font-medium rounded transition"
                >
                  {copied ? t("copied") : t("copy")}
                </button>
              </div>
            </div>

            <p className="text-xs text-[var(--text-mid)]">
              Slug: <span className="font-mono font-medium">{slug}</span>
            </p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-[var(--text-dark)] mb-3">{t("widgetFeatures")}</h2>
            <ul className="space-y-2 text-sm text-[var(--text-mid)]">
              <li className="flex gap-3">
                <span className="text-[var(--primary)]">✓</span>
                <span>{t("badgeFeature")}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[var(--primary)]">✓</span>
                <span>{t("readStatusFeature")}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[var(--primary)]">✓</span>
                <span>{t("responsivePopupFeature")}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[var(--primary)]">✓</span>
                <span>{t("zeroDependencyFeature")}</span>
              </li>
            </ul>
          </div>

          <div>
            <button
              onClick={handleLoadFreePreview}
              className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--text-mid)] text-white text-sm font-medium rounded-lg transition"
            >
              {freeLoaded ? t("hidePreview") : t("loadPreview")}
            </button>
            {freeLoaded && (
              <p className="mt-3 text-xs text-[var(--text-mid)]">
                {t("widgetVisibleInfo")}
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === "inline" && (
        <div className="space-y-6">
          {isPro ? (
            <>
              <div>
                <p className="text-sm text-[var(--text-mid)] mb-4">
                  {t("widgetInlineInstructions")}
                </p>

                <div className="bg-[var(--surface)] border border-[var(--border-soft)] rounded-lg p-4 mb-3">
                  <div className="relative pr-20">
                    <code className="text-[var(--text-dark)] text-sm font-mono block break-all whitespace-pre-wrap">
                      {inlineSnippet}
                    </code>
                    <button
                      onClick={handleCopyProCode}
                      className="absolute top-0 right-0 px-3 py-1.5 bg-[var(--primary)] hover:bg-[var(--text-mid)] text-white text-xs font-medium rounded transition"
                    >
                      {proCopied ? t("copied") : t("copy")}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-medium text-[var(--text-dark)] mb-3">{t("widgetConfiguration")}</h2>
                <div className="border border-[var(--border-soft)] rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--surface)" }}>
                        <th className="text-left py-2 px-3 text-xs font-medium text-[var(--text-mid)]">{t("configAttr")}</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-[var(--text-mid)]">{t("configValues")}</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-[var(--text-mid)]">{t("configDesc")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { attr: "data-style", values: '"popup", "inline"', desc: t("configStyleDesc") },
                        { attr: "data-limit", values: "1–10", desc: t("configLimitDesc") },
                        { attr: "data-category", values: '"feature", "fix", …', desc: t("configCategoryDesc") },
                        { attr: "data-position", values: '"bottom-right", "bottom-left"', desc: t("configPositionDesc") },
                      ].map((row, i, arr) => (
                        <tr
                          key={row.attr}
                          className={i < arr.length - 1 ? "border-b" : ""}
                          style={{ borderColor: "var(--border-soft)" }}
                        >
                          <td className="py-2 px-3 font-mono text-xs text-[var(--text-mid)]">{row.attr}</td>
                          <td className="py-2 px-3 text-xs text-[var(--text-mid)]">{row.values}</td>
                          <td className="py-2 px-3 text-xs text-[var(--text-mid)]">{row.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-medium text-[var(--text-dark)] mb-3">{t("widgetPreview")}</h2>
                <button
                  onClick={handleLoadProPreview}
                  className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--text-mid)] text-white text-sm font-medium rounded-lg transition mb-4"
                >
                  {proLoaded ? t("hidePreview") : t("loadPreview")}
                </button>
                <div
                  id="pushlog-pro-preview"
                  className={`min-h-[200px] border border-[var(--border-soft)] rounded-lg overflow-y-auto ${
                    proLoaded ? "bg-[var(--background)]" : "bg-[var(--surface)]"
                  }`}
                />
              </div>
            </>
          ) : (
            <div className="p-5 bg-[var(--surface)] border border-[var(--border-soft)] rounded-lg">
              <h2 className="text-sm font-medium text-[var(--text-dark)] mb-2">
                {t("proFeatureTitle")}
              </h2>
              <p className="text-sm text-[var(--text-mid)] mb-4">
                {t("proFeatureDesc")}
              </p>
              <ul className="space-y-2 text-sm text-[var(--text-mid)] mb-5">
                {[
                  t("inlineStyleFeature"),
                  t("configurablePositionFeature"),
                  t("moreEntriesFeature"),
                  t("noPoweredByFeature"),
                ].map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className="text-[var(--primary)]">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--text-mid)] text-white text-sm font-medium rounded-lg transition">
                {t("upgradeNow")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
