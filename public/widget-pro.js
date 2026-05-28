(function () {
  "use strict";

  // Guard against multiple widget instances
  if (window.__pushlogProLoaded) {
    return;
  }
  window.__pushlogProLoaded = true;

  // Get the product slug from the script tag
  const script = document.currentScript;
  const productSlug = script?.getAttribute("data-product");

  if (!productSlug) {
    console.error(
      "[Pushlog Widget Pro] data-product attribute is required on script tag"
    );
    return;
  }

  // Pro attributes
  const widgetStyle = script?.getAttribute("data-style") || "popup";
  const limit = parseInt(script?.getAttribute("data-limit") || "5", 10);
  const category = script?.getAttribute("data-category") || null;
  const position = script?.getAttribute("data-position") || "bottom-right";
  const targetSelector = script?.getAttribute("data-target") || null;

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

  let entries = [];
  let isOpen = false;
  let isPro = false;

  // Fetch entries from API
  async function fetchEntries() {
    try {
      const fetchLimit = Math.min(limit, 10);
      let url = `${API_BASE}/api/widget/${productSlug}?limit=${fetchLimit}`;
      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch entries");
      return await response.json();
    } catch (error) {
      console.error("[Pushlog Widget Pro] Error fetching entries:", error);
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

  // Truncate body to teaser
  function getTeaser(body, maxLength = 100) {
    if (body.length <= maxLength) return body;
    return body.substring(0, maxLength).trim() + "...";
  }

  // Create and inject styles
  function injectStyles() {
    const styleId = "pushlog-widget-pro-styles";
    if (document.getElementById(styleId)) return;

    const styleEl = document.createElement("style");
    styleEl.id = styleId;

    let buttonStyles = "";
    if (widgetStyle === "popup") {
      if (position === "bottom-left") {
        buttonStyles = `
          .pushlog-button {
            bottom: 24px;
            left: 24px;
            right: auto;
          }
          .pushlog-popup {
            right: auto;
            left: 20px;
          }
        `;
      } else {
        buttonStyles = `
          .pushlog-button {
            bottom: 24px;
            right: 24px;
          }
        `;
      }
    }

    styleEl.textContent = `
      ${buttonStyles}
      .pushlog-button {
        position: fixed;
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

      .pushlog-inline-container {
        padding: 16px;
        background-color: ${COLORS.background};
        border: 1px solid ${COLORS.border};
        border-radius: 12px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .pushlog-inline-container h3 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 600;
        color: ${COLORS.text};
      }

      .pushlog-inline-list {
        max-height: 400px;
        overflow-y: auto;
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

      .pushlog-entry-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
      }

      .pushlog-entry-category {
        font-size: 9px;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 4px;
        text-transform: uppercase;
        white-space: nowrap;
      }

      .pushlog-entry-title {
        font-size: 13px;
        font-weight: 600;
        color: ${COLORS.text};
        margin: 0;
      }

      .pushlog-entry-body {
        font-size: 12px;
        color: #633806;
        margin: 6px 0 0 0;
        line-height: 1.4;
      }

      .pushlog-entry-date {
        font-size: 11px;
        color: ${COLORS.primary};
        margin-top: 6px;
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
      const categoryColors = {
        New: { bg: "#085041", text: "#9FE1CB" },
        Fix: { bg: "#FAEEDA", text: "#633806" },
        Improved: { bg: "#085041", text: "#9FE1CB" },
        Removed: { bg: "#FFE4E1", text: "#8B0000" },
      };

      const colors = categoryColors[entry.category] || {
        bg: "#F5F5F5",
        text: "#666",
      };

      const entryEl = document.createElement("div");
      entryEl.className = "pushlog-entry";
      entryEl.innerHTML = `
        <div class="pushlog-entry-header">
          <span class="pushlog-entry-category" style="background-color: ${colors.bg}; color: ${colors.text};">
            ${entry.category}
          </span>
          <p class="pushlog-entry-title">${escapeHtml(entry.title)}</p>
        </div>
        <p class="pushlog-entry-body">${escapeHtml(getTeaser(entry.body))}</p>
        <p class="pushlog-entry-date">${formatDate(entry.publishedAt)}</p>
      `;
      content.appendChild(entryEl);
    });
  }

  // Render inline style
  function renderInline(productName) {
    function doRender() {
      const targetEl = targetSelector ? document.querySelector(targetSelector) : null;

      if (!targetEl) return false;
      if (targetEl.dataset.pushlogLoaded) return true;

      targetEl.dataset.pushlogLoaded = "true";
      targetEl.innerHTML = "";

      const container = document.createElement("div");
      container.className = "pushlog-inline-container";
      container.id = "pushlog-inline-widget";
      container.innerHTML = `
        <h3>${escapeHtml(productName)}</h3>
        <div class="pushlog-inline-list"></div>
      `;

      const list = container.querySelector(".pushlog-inline-list");

      if (entries.length === 0) {
        list.innerHTML = `
          <div style="padding: 12px; text-align: center; color: #633806; font-size: 13px;">
            No updates yet
          </div>
        `;
      } else {
        entries.forEach((entry) => {
          const categoryColors = {
            New: { bg: "#085041", text: "#9FE1CB" },
            Fix: { bg: "#FAEEDA", text: "#633806" },
            Improved: { bg: "#085041", text: "#9FE1CB" },
            Removed: { bg: "#FFE4E1", text: "#8B0000" },
          };

          const colors = categoryColors[entry.category] || {
            bg: "#F5F5F5",
            text: "#666",
          };

          const entryEl = document.createElement("div");
          entryEl.className = "pushlog-entry";
          entryEl.innerHTML = `
            <div class="pushlog-entry-header">
              <span class="pushlog-entry-category" style="background-color: ${colors.bg}; color: ${colors.text};">
                ${entry.category}
              </span>
              <p class="pushlog-entry-title">${escapeHtml(entry.title)}</p>
            </div>
            <p class="pushlog-entry-body">${escapeHtml(getTeaser(entry.body))}</p>
            <p class="pushlog-entry-date">${formatDate(entry.publishedAt)}</p>
          `;
          list.appendChild(entryEl);
        });
      }

      targetEl.appendChild(container);
      return true;
    }

    if (doRender()) return;

    const observer = new MutationObserver(() => {
      if (doRender()) {
        observer.disconnect();
      }
    });

    observer.observe(document, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => observer.disconnect(), 10000);
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
    `;
    popup.style.display = "none";
    document.body.appendChild(popup);
  }

  // Create button
  function createButton() {
    const button = document.createElement("button");
    button.className = "pushlog-button";
    if (widgetStyle === "inline") {
      button.style.display = "none";
    }
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
    isPro = data.isPro || false;

    // Check if Pro plan is required
    if (!isPro) {
      console.warn("[Pushlog Widget Pro] Pro plan required for widget-pro.js");
      return;
    }

    injectStyles();

    if (widgetStyle === "popup") {
      createButton();
      createPopup(data.product.name);
      createOverlay();
      updateBadge();
    } else if (widgetStyle === "inline") {
      renderInline(data.product.name);
    }
  }

  // Wait for DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
