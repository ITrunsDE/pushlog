"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function SubscribeForm({ slug, ownerPlan }: { slug: string; ownerPlan: string }) {
  const t = useTranslations("changelog");
  const [email, setEmail] = useState("");
  const weeklyAllowed = ownerPlan !== "free";
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("monthly");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/subscribe/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, frequency }),
      });

      const data = await res.json();

      if (!res.ok) {
        const text =
          data.error === "subscriber_limit_reached"
            ? t("subscriptionsClosed")
            : data.error || t("subscribeError");
        setMessage({ type: "error", text });
      } else {
        setMessage({ type: "success", text: t("confirmationSent") });
        setEmail("");
      }
    } catch {
      setMessage({ type: "error", text: t("subscribeError") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-lg p-8 border"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-soft)" }}
    >
      <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--text-dark)" }}>
        {t("subscribe")}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2"
            style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--background)", color: "var(--text-dark)" }}
          />
        </div>

        {weeklyAllowed ? (
          <div className="flex gap-4">
            <label className="flex items-center gap-2 flex-1">
              <input
                type="radio"
                name="frequency"
                value="weekly"
                checked={frequency === "weekly"}
                onChange={(e) => setFrequency(e.target.value as "weekly" | "monthly")}
                disabled={loading}
                className="cursor-pointer"
              />
              <span style={{ color: "var(--text-mid)" }} className="text-sm">
                {t("weekly")}
              </span>
            </label>
            <label className="flex items-center gap-2 flex-1">
              <input
                type="radio"
                name="frequency"
                value="monthly"
                checked={frequency === "monthly"}
                onChange={(e) => setFrequency(e.target.value as "weekly" | "monthly")}
                disabled={loading}
                className="cursor-pointer"
              />
              <span style={{ color: "var(--text-mid)" }} className="text-sm">
                {t("monthly")}
              </span>
            </label>
          </div>
        ) : (
          <input type="hidden" name="frequency" value="monthly" />
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded font-medium transition-colors"
          style={{
            backgroundColor: loading ? "var(--border-strong)" : "var(--primary)",
            color: "var(--background)",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? t("subscribing") : t("subscribeButton")}
        </button>
      </form>

      {message && (
        <div
          className="mt-4 p-3 rounded text-sm"
          style={{
            backgroundColor: message.type === "success" ? "rgba(76, 175, 80, 0.1)" : "rgba(244, 67, 54, 0.1)",
            color: message.type === "success" ? "#2E7D32" : "#C62828",
            borderLeft: message.type === "success" ? "4px solid #4CAF50" : "4px solid #F44336",
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
