"use client";

import { useState } from "react";
import type { User } from "@prisma/client";

interface AccountSettingsProps {
  user: User;
}

export default function AccountSettings({ user }: AccountSettingsProps) {
  const [name, setName] = useState(user.name || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name erforderlich");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/user/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fehler beim Speichern");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="rounded-lg p-6 border"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-soft)" }}
    >
      <h2 className="text-xl font-medium text-[var(--text-dark)] mb-6">Account</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--text-dark)] mb-2">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg text-[var(--text-dark)] placeholder-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--text-dark)] mb-2">
          Email
        </label>
        <input
          type="email"
          value={user.email || ""}
          disabled
          className="w-full px-4 py-2 bg-[#f5f5f5] border border-[#e0e0e0] rounded-lg text-[#999] cursor-not-allowed"
        />
        <p className="text-xs text-[var(--text-mid)] mt-1">Kann nicht geändert werden</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-6">
          <p className="text-sm text-green-700">Gespeichert ✓</p>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-[var(--primary)] hover:bg-[var(--text-mid)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition"
      >
        {saving ? "Wird gespeichert..." : "Speichern"}
      </button>
    </div>
  );
}
