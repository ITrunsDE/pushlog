"use client";

import { useState } from "react";

declare global {
  interface Window {
    __pushlogFreeLoaded?: boolean;
    __pushlogProLoaded?: boolean;
  }
}

export function WidgetClient({ slug, userPlan = "free" }: { slug: string | null; userPlan?: string }) {
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

    // Clean up old widget if reloading
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

    // Inject free widget script
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

    // Clean up old widget if reloading
    if (proLoaded) {
      delete window.__pushlogProLoaded;
      const existingScript = document.querySelector(
        'script[src*="widget-pro.js"]'
      );
      if (existingScript) existingScript.remove();

      const target = document.getElementById("pushlog-pro-preview");
      if (target) {
        target.innerHTML = "";
        target.removeAttribute("data-pushlog-loaded");
      }

      setProLoaded(false);
      return;
    }

    // Inject pro widget script AFTER checking target exists
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
          <p className="text-sm text-red-700">
            Kein Produkt gefunden. Bitte erstelle zunächst ein Produkt.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-8 max-w-4xl">
      <h1 className="text-3xl font-medium text-[#2C2B28] mb-2 font-[family-name:var(--font-display)]">
        Embeddable Widget
      </h1>
      <p className="text-[#633806] text-sm mb-8">
        Integriere dein Pushlog Widget auf jeder Website
      </p>

      {/* Free Widget Section */}
      <div className="mb-12">
        <h2 className="text-xl font-medium text-[#2C2B28] mb-4">Free Widget</h2>
        <p className="text-[#633806] text-sm mb-4">
          Kopiere diesen Code und füge ihn auf deiner Website ein. Das Widget
          wird automatisch in der unteren rechten Ecke angezeigt mit einer Glocken-Button.
        </p>

        <div className="bg-[#fef9ee] border border-[#FAC775] rounded-lg p-4 mb-4">
          <div className="relative">
            <code className="text-[#2C2B28] text-sm font-mono block break-all">
              {freeScriptTag}
            </code>
            <button
              onClick={handleCopyCode}
              className="absolute top-2 right-2 px-3 py-1.5 bg-[#BA7517] hover:bg-[#9a6514] text-white text-xs font-medium rounded transition"
            >
              {copied ? "✓ Kopiert!" : "Kopieren"}
            </button>
          </div>
        </div>

        <p className="text-xs text-[#854F0B] mb-4">
          Slug: <span className="font-mono font-medium">{slug}</span>
        </p>

        <button
          onClick={handleLoadFreePreview}
          className="px-6 py-2.5 bg-[#BA7517] hover:bg-[#9a6514] text-white font-medium rounded-lg transition"
        >
          {freeLoaded ? "✓ Free Preview laden" : "Free Preview laden"}
        </button>

        {freeLoaded && (
          <div className="mt-4 p-4 bg-[#fffdf8] border border-[#FAC775] rounded-lg">
            <p className="text-xs text-[#854F0B]">
              Das Widget sollte jetzt in der unteren rechten Ecke des Fensters
              sichtbar sein (Glocken-Button 🔔). Klicke darauf um das Popup zu öffnen.
            </p>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="mb-12">
        <h2 className="text-xl font-medium text-[#2C2B28] mb-4">Features</h2>
        <ul className="space-y-2 text-sm text-[#633806]">
          <li className="flex gap-3">
            <span className="text-[#BA7517]">✓</span>
            <span>Automatische Badge mit Anzahl neuer Updates</span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#BA7517]">✓</span>
            <span>Read-Status wird lokal gespeichert (keine Datenerfassung)</span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#BA7517]">✓</span>
            <span>Responsive Popup mit allen Einträgen</span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#BA7517]">✓</span>
            <span>Zero-Dependency, Performance-optimiert</span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#BA7517]">✓</span>
            <span>Passt sich automatisch der Amber Design an</span>
          </li>
        </ul>
      </div>

      {/* Pro Features Section */}
      {isPro ? (
        <div>
          <h2 className="text-xl font-medium text-[#2C2B28] mb-4">Pro Features</h2>
          <p className="text-[#633806] text-sm mb-4">
            Mit deinem Pro-Plan hast du Zugriff auf erweiterte Konfigurationsoptionen:
          </p>

          {/* Pro Attributes Table */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#FAC775]">
                  <th className="text-left py-2 px-3 text-[#2C2B28] font-semibold">Attribut</th>
                  <th className="text-left py-2 px-3 text-[#2C2B28] font-semibold">Werte</th>
                  <th className="text-left py-2 px-3 text-[#2C2B28] font-semibold">Beschreibung</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#FAC775]">
                  <td className="py-2 px-3 text-[#633806] font-mono">data-style</td>
                  <td className="py-2 px-3 text-[#633806]">"popup", "inline"</td>
                  <td className="py-2 px-3 text-[#633806]">Darstellungsweise des Widgets</td>
                </tr>
                <tr className="border-b border-[#FAC775]">
                  <td className="py-2 px-3 text-[#633806] font-mono">data-limit</td>
                  <td className="py-2 px-3 text-[#633806]">1-10</td>
                  <td className="py-2 px-3 text-[#633806]">Max. Anzahl der Einträge</td>
                </tr>
                <tr className="border-b border-[#FAC775]">
                  <td className="py-2 px-3 text-[#633806] font-mono">data-category</td>
                  <td className="py-2 px-3 text-[#633806]">"feature", "fix", "improvement", "security"</td>
                  <td className="py-2 px-3 text-[#633806]">Filter nach Kategorie</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-[#633806] font-mono">data-position</td>
                  <td className="py-2 px-3 text-[#633806]">"bottom-right", "bottom-left"</td>
                  <td className="py-2 px-3 text-[#633806]">Position des Popup-Buttons (nur bei data-style="popup")</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pro Code Snippet */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-[#2C2B28] mb-3">Pro Snippet Beispiel</h3>
            <div className="bg-[#fef9ee] border border-[#FAC775] rounded-lg p-4 mb-4">
              <div className="relative">
                <code className="text-[#2C2B28] text-sm font-mono block break-all">
                  {proScriptTag}
                </code>
                <button
                  onClick={handleCopyProCode}
                  className="absolute top-2 right-2 px-3 py-1.5 bg-[#BA7517] hover:bg-[#9a6514] text-white text-xs font-medium rounded transition"
                >
                  {proCopied ? "✓ Kopiert!" : "Kopieren"}
                </button>
              </div>
            </div>

            <h3 className="text-lg font-medium text-[#2C2B28] mb-3 mt-6">Inline Style Beispiel</h3>
            <p className="text-[#633806] text-sm mb-3">
              Mit <code className="font-mono bg-[#fef9ee] px-2 py-1 rounded">data-style="inline"</code> wird das Widget als Liste direkt auf der Website eingebunden:
            </p>
            <div className="bg-[#fef9ee] border border-[#FAC775] rounded-lg p-4 mb-4">
              <div className="relative">
                <code className="text-[#2C2B28] text-sm font-mono block break-all">
                  {`<div id="my-changelog"><\/div>\n<script src="https://pushlog.io/widget-pro.js" data-product="${slug}" data-style="inline" data-target="#my-changelog" data-limit="3"><\/script>`}
                </code>
              </div>
            </div>
          </div>

          {/* Pro Preview Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-[#2C2B28] mb-3">Inline Preview</h3>
            <p className="text-[#633806] text-sm mb-4">
              Sieh dir hier eine Vorschau des Inline-Styles an:
            </p>

            <button
              onClick={handleLoadProPreview}
              className="px-6 py-2.5 bg-[#BA7517] hover:bg-[#9a6514] text-white font-medium rounded-lg transition mb-4"
            >
              {proLoaded ? "✓ Pro Preview laden" : "Pro Preview laden"}
            </button>

            <div className="mt-4">
              <p className="text-xs text-[#854F0B] mb-3">
                Pro Widget Inline Preview:
              </p>
              <div
                id="pushlog-pro-preview"
                className={`min-h-[300px] border border-[#FAC775] rounded-lg overflow-y-auto ${
                  proLoaded ? "bg-[#fffdf8]" : "bg-gray-100"
                }`}
              ></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-[#fef9ee] border border-[#FAC775] rounded-lg">
          <h2 className="text-lg font-medium text-[#2C2B28] mb-3">
            🎯 Upgrade zu Pro für erweiterte Features
          </h2>
          <p className="text-[#633806] text-sm mb-4">
            Mit einem Pro-Plan erhältst du:
          </p>
          <ul className="space-y-2 text-sm text-[#633806] mb-4">
            <li className="flex gap-3">
              <span className="text-[#BA7517]">✓</span>
              <span>Inline-Style Widget (direkt auf der Website)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#BA7517]">✓</span>
              <span>Konfigurierbare Widget-Position</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#BA7517]">✓</span>
              <span>Kategorie-Filter für Updates</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#BA7517]">✓</span>
              <span>Bis zu 10 Einträge anzeigen (statt 5)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#BA7517]">✓</span>
              <span>Kein "Powered by Pushlog" Footer</span>
            </li>
          </ul>
          <button className="px-6 py-2.5 bg-[#BA7517] hover:bg-[#9a6514] text-white font-medium rounded-lg transition">
            Jetzt upgraden
          </button>
        </div>
      )}
    </div>
  );
}
