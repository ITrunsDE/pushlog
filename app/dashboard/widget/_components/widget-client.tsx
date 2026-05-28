"use client";

import { useState } from "react";

export function WidgetClient({ slug, userPlan = "free" }: { slug: string | null; userPlan?: string }) {
  const [copied, setCopied] = useState(false);
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [proCopied, setProCopied] = useState(false);
  const [proWidgetLoaded, setProWidgetLoaded] = useState(false);
  const isPro = userPlan === "pro";

  const scriptTag = slug
    ? `<script src="https://pushlog.io/widget.js" data-product="${slug}"><\/script>`
    : "";

  const handleCopyCode = async () => {
    if (!scriptTag) return;
    try {
      await navigator.clipboard.writeText(scriptTag);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleLoadPreview = () => {
    if (!slug) return;

    // Inject widget script (use current host for dev/prod)
    const script = document.createElement("script");
    const host = typeof window !== "undefined" ? window.location.origin : "https://pushlog.io";
    script.src = `${host}/widget.js`;
    script.setAttribute("data-product", slug);
    document.body.appendChild(script);

    setWidgetLoaded(true);
  };

  const handleCopyProCode = async () => {
    if (!slug) return;
    const scriptTag = `<script src="https://pushlog.io/widget.js" data-product="${slug}" data-style="popup" data-position="bottom-right" data-limit="5" data-category="feature"><\/script>`;
    try {
      await navigator.clipboard.writeText(scriptTag);
      setProCopied(true);
      setTimeout(() => setProCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleLoadProPreview = () => {
    if (!slug) return;

    // Clear previous script
    const existingScript = document.querySelector(
      'script[data-product][data-style="inline"]'
    );
    if (existingScript) existingScript.remove();

    // Clear previous widget content and reset guard
    const target = document.getElementById("pushlog-inline-preview");
    if (target) {
      target.innerHTML = "";
      target.removeAttribute("data-pushlog-loaded");
    }

    setProWidgetLoaded(true);

    // Inject widget script AFTER checking target exists
    setTimeout(() => {
      const targetDiv = document.getElementById("pushlog-inline-preview");
      if (!targetDiv) {
        console.error("[Pushlog] Target div not found");
        return;
      }

      const script = document.createElement("script");
      const host = typeof window !== "undefined" ? window.location.origin : "https://pushlog.io";
      script.src = `${host}/widget.js`;
      script.setAttribute("data-product", slug);
      script.setAttribute("data-style", "inline");
      script.setAttribute("data-target", "#pushlog-inline-preview");
      script.setAttribute("data-limit", "5");
      document.head.appendChild(script);
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

      {/* Integration Section */}
      <div className="mb-12">
        <h2 className="text-xl font-medium text-[#2C2B28] mb-4">Integration</h2>
        <p className="text-[#633806] text-sm mb-4">
          Kopiere diesen Code und füge ihn auf deiner Website ein. Das Widget
          wird automatisch in der unteren rechten Ecke angezeigt.
        </p>

        <div className="bg-[#fef9ee] border border-[#FAC775] rounded-lg p-4 mb-4">
          <div className="relative">
            <code className="text-[#2C2B28] text-sm font-mono block break-all">
              {scriptTag}
            </code>
            <button
              onClick={handleCopyCode}
              className="absolute top-2 right-2 px-3 py-1.5 bg-[#BA7517] hover:bg-[#9a6514] text-white text-xs font-medium rounded transition"
            >
              {copied ? "✓ Kopiert!" : "Kopieren"}
            </button>
          </div>
        </div>

        <p className="text-xs text-[#854F0B]">
          Slug: <span className="font-mono font-medium">{slug}</span>
        </p>
      </div>

      {/* Live Preview Section */}
      <div className="mb-12">
        <h2 className="text-xl font-medium text-[#2C2B28] mb-4">
          Live Preview
        </h2>
        <p className="text-[#633806] text-sm mb-6">
          Klicke auf den Button unten, um das Widget in diesem Fenster zu laden.
          Im echten Einsatz erscheint das Widget automatisch beim Laden der
          Website.
        </p>

        <button
          onClick={handleLoadPreview}
          disabled={widgetLoaded}
          className="px-6 py-2.5 bg-[#BA7517] hover:bg-[#9a6514] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
        >
          {widgetLoaded ? "✓ Widget geladen" : "Preview laden"}
        </button>

        {widgetLoaded && (
          <div className="mt-4 p-4 bg-[#fffdf8] border border-[#FAC775] rounded-lg">
            <p className="text-xs text-[#854F0B]">
              Das Widget sollte jetzt in der unteren rechten Ecke des Fensters
              sichtbar sein. Klicke auf die Glocke (🔔) um das Popup zu öffnen.
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
                  {`<script src="https://pushlog.io/widget.js" data-product="${slug}" data-style="popup" data-position="bottom-right" data-limit="5" data-category="feature"><\/script>`}
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
                  {`<div id="my-changelog"><\/div>\n<script src="https://pushlog.io/widget.js" data-product="${slug}" data-style="inline" data-target="#my-changelog" data-limit="3"><\/script>`}
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
              disabled={proWidgetLoaded}
              className="px-6 py-2.5 bg-[#BA7517] hover:bg-[#9a6514] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition mb-4"
            >
              {proWidgetLoaded ? "✓ Preview geladen" : "Inline Preview laden"}
            </button>

            <div className="mt-4">
              <p className="text-xs text-[#854F0B] mb-3">
                Inline Widget Preview:
              </p>
              <div
                id="pushlog-inline-preview"
                className={`min-h-[300px] border border-[#FAC775] rounded-lg overflow-y-auto ${
                  proWidgetLoaded ? "bg-[#fffdf8]" : "bg-gray-100"
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
