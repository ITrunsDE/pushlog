(function () {
  "use strict";

  // Guard against multiple widget instances
  if (window.__pushlogFreeLoaded) {
    return;
  }
  window.__pushlogFreeLoaded = true;

  // Get the product slug from the script tag
  const script = document.currentScript;
  const productSlug = script?.getAttribute("data-product");

  if (!productSlug) {
    console.error(
      "[Pushlog Widget] data-product attribute is required on script tag"
    );
    return;
  }

  // Determine API base from script src or use production domain
  const scriptSrc = script?.src || '';
  const scriptOrigin = scriptSrc ? new URL(scriptSrc).origin : window.location.origin;
  const API_BASE = scriptOrigin || "https://pushlog.io";
  const STORAGE_KEY = `pushlog_read_${productSlug}`;
  const COLORS = {
    primary: "#BA7517",
    background: "#fffdf8",
    border: "#FAC775",
    text: "#2C2B28",
    lightBg: "#fef9ee",
  };

  const SECTION_COLORS = {
    feature:     { bg: "#DBEAFE", text: "#1D4ED8" },
    fix:         { bg: "#FEE2E2", text: "#B91C1C" },
    improvement: { bg: "#FEF3C7", text: "#92400E" },
    security:    { bg: "#DCFCE7", text: "#166534" },
    performance: { bg: "#F3E8FF", text: "#7E22CE" },
  };

  const SECTION_LABELS = {
    feature: "✨ Feature",
    fix: "🐛 Fix",
    improvement: "⚡ Improvement",
    security: "🔒 Security",
    performance: "🚀 Performance",
  };

  let entries = [];
  let isOpen = false;

  // Fetch entries from API
  async function fetchEntries() {
    try {
      const url = `${API_BASE}/api/widget/${productSlug}?limit=5`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch entries");
      return await response.json();
    } catch (error) {
      console.error("[Pushlog Widget] Error fetching entries:", error);
      return null;
    }
  }

  // Get read entries from localStorage
  function getReadEntries() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Save read entries to localStorage
  function saveReadEntries(ids) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }

  // Get unread count
  function getUnreadCount() {
    const readIds = new Set(getReadEntries());
    return entries.filter((e) => !readIds.has(e.id)).length;
  }

  // Format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // HTML escape
  function escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  // Create and inject styles
  function injectStyles() {
    const styleId = "pushlog-widget-styles";
    if (document.getElementById(styleId)) return;

    const styleEl = document.createElement("style");
    styleEl.id = styleId;

    styleEl.textContent = `
      .pushlog-button {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background-color: ${COLORS.primary};
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        box-shadow: 0 4px 12px rgba(186, 117, 23, 0.3);
        z-index: 999999;
        transition: transform 0.2s, box-shadow 0.2s;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .pushlog-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(186, 117, 23, 0.4);
      }

      .pushlog-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background-color: #d32f2f;
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        border: 2px solid white;
      }

      .pushlog-popup {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 360px;
        background-color: ${COLORS.background};
        border: 1px solid ${COLORS.border};
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        z-index: 999998;
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        max-height: 500px;
      }

      .pushlog-popup-header {
        padding: 16px;
        border-bottom: 1px solid ${COLORS.border};
        background-color: ${COLORS.lightBg};
      }

      .pushlog-popup-header h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: ${COLORS.text};
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .pushlog-popup-header p {
        margin: 4px 0 0 0;
        font-size: 16px;
        font-weight: 600;
        color: ${COLORS.text};
      }

      .pushlog-popup-content {
        overflow-y: auto;
        flex: 1;
        padding: 12px;
      }

      .pushlog-entry {
        padding: 12px;
        margin-bottom: 8px;
        background-color: white;
        border: 1px solid ${COLORS.border};
        border-radius: 8px;
        transition: background-color 0.2s;
      }

      .pushlog-entry:hover {
        background-color: ${COLORS.lightBg};
      }

      .pushlog-entry-title {
        font-size: 13px;
        font-weight: 600;
        color: ${COLORS.text};
        margin: 0 0 8px 0;
      }

      .pushlog-section-badge {
        display: inline-block;
        font-size: 9px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 4px;
        text-transform: uppercase;
        white-space: nowrap;
        margin-bottom: 4px;
      }

      .pushlog-section-items {
        margin: 0 0 6px 0;
        padding: 0;
        list-style: none;
      }

      .pushlog-section-items li {
        font-size: 11px;
        color: #633806;
        line-height: 1.4;
        padding-left: 10px;
        position: relative;
      }

      .pushlog-section-items li::before {
        content: "•";
        position: absolute;
        left: 0;
      }

      .pushlog-entry-date {
        font-size: 11px;
        color: ${COLORS.primary};
        margin-top: 6px;
      }

      .pushlog-popup-footer {
        padding: 12px 16px;
        border-top: 1px solid ${COLORS.border};
        background-color: ${COLORS.lightBg};
        text-align: center;
      }

      .pushlog-popup-footer a {
        font-size: 11px;
        color: ${COLORS.primary};
        text-decoration: none;
        transition: opacity 0.2s;
      }

      .pushlog-popup-footer a:hover {
        opacity: 0.7;
      }

      .pushlog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 999997;
        display: none;
      }

      .pushlog-overlay.active {
        display: block;
      }
    `;
    document.head.appendChild(styleEl);
  }

  // Update badge count
  function updateBadge() {
    const badge = document.querySelector(".pushlog-badge");
    if (!badge) return;

    const unreadCount = getUnreadCount();
    if (unreadCount === 0) {
      badge.style.display = "none";
    } else {
      badge.style.display = "flex";
      badge.textContent = unreadCount;
    }
  }

  // Render entries in popup
  function renderEntries() {
    const content = document.querySelector(".pushlog-popup-content");
    if (!content) return;

    content.innerHTML = "";

    if (entries.length === 0) {
      content.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #633806; font-size: 13px;">
          No updates yet
        </div>
      `;
      return;
    }

    entries.forEach((entry) => {
      const entryEl = document.createElement("div");
      entryEl.className = "pushlog-entry";

      const titleHtml = `<p class="pushlog-entry-title">${escapeHtml(entry.title)}${entry.version ? ` <span style="font-size:11px;font-weight:400;color:#854F0B">v${escapeHtml(entry.version)}</span>` : ""}</p>`;

      const sectionsHtml = (entry.sections || []).map((section) => {
        const colors = SECTION_COLORS[section.type] || { bg: "#F4F4F5", text: "#52525B" };
        const label = SECTION_LABELS[section.type] || section.type;
        let items = [];
        try { items = JSON.parse(section.items); } catch {}
        const itemsHtml = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
        return `
          <div>
            <span class="pushlog-section-badge" style="background-color:${colors.bg};color:${colors.text}">${escapeHtml(label)}</span>
            <ul class="pushlog-section-items">${itemsHtml}</ul>
          </div>
        `;
      }).join("");

      entryEl.innerHTML = `
        ${titleHtml}
        ${sectionsHtml}
        <p class="pushlog-entry-date">${formatDate(entry.publishedAt)}</p>
      `;
      content.appendChild(entryEl);
    });
  }

  // Toggle popup
  function togglePopup() {
    isOpen = !isOpen;
    const popup = document.querySelector(".pushlog-popup");
    const overlay = document.querySelector(".pushlog-overlay");

    if (isOpen) {
      popup.style.display = "flex";
      overlay.classList.add("active");
      const readIds = getReadEntries();
      entries.forEach((e) => {
        if (!readIds.includes(e.id)) {
          readIds.push(e.id);
        }
      });
      saveReadEntries(readIds);
      updateBadge();
      renderEntries();
    } else {
      popup.style.display = "none";
      overlay.classList.remove("active");
    }
  }

  // Create popup
  function createPopup(productName) {
    const popup = document.createElement("div");
    popup.className = "pushlog-popup";
    popup.innerHTML = `
      <div class="pushlog-popup-header">
        <h3>What's New</h3>
        <p>${escapeHtml(productName)}</p>
      </div>
      <div class="pushlog-popup-content"></div>
      <div class="pushlog-popup-footer">
        <a href="https://pushlog.io" target="_blank" rel="noopener noreferrer">Powered by Pushlog</a>
      </div>
    `;
    popup.style.display = "none";
    document.body.appendChild(popup);
  }

  // Create button
  function createButton() {
    const button = document.createElement("button");
    button.className = "pushlog-button";
    button.innerHTML = `
      🔔
      <div class="pushlog-badge"></div>
    `;
    button.addEventListener("click", togglePopup);
    document.body.appendChild(button);
  }

  // Create overlay
  function createOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "pushlog-overlay";
    overlay.addEventListener("click", () => {
      if (isOpen) togglePopup();
    });
    document.body.appendChild(overlay);
  }

  // Initialize widget
  async function init() {
    const data = await fetchEntries();
    if (!data || !data.entries) return;

    entries = data.entries;

    injectStyles();
    createButton();
    createPopup(data.product.name);
    createOverlay();
    updateBadge();
  }

  // Wait for DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
