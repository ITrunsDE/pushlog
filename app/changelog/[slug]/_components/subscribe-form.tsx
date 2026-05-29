"use client";

import { useState } from "react";

export default function SubscribeForm({ slug, ownerPlan }: { slug: string; ownerPlan: string }) {
  const [email, setEmail] = useState("");
  const weeklyAllowed = ownerPlan !== "free";
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("monthly");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
            ? "Subscriptions are currently closed."
            : data.error || "Fehler beim Abonnieren";
        setMessage({ type: "error", text });
      } else {
        setMessage({
          type: "success",
          text: "Bestätigungsmail wurde gesendet. Bitte überprüfe dein E-Mail-Postfach.",
        });
        setEmail("");
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Ein Fehler ist aufgetreten. Versuche es später erneut.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-lg p-8 border"
      style={{
        backgroundColor: "#fef9ee",
        borderColor: "#FAC775",
      }}
    >
      <h2
        className="text-2xl font-semibold mb-6"
        style={{ color: "#412402" }}
      >
        Updates nicht verpassen
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="deine@email.de"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2"
            style={{
              borderColor: "#FAC775",
              backgroundColor: "#fffdf8",
              color: "#412402",
            }}
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
              <span style={{ color: "#633806" }} className="text-sm">
                Wöchentlich
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
              <span style={{ color: "#633806" }} className="text-sm">
                Monatlich
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
            backgroundColor: loading ? "#D4AF83" : "#BA7517",
            color: "#fffdf8",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Wird abonniert..." : "Abonnieren"}
        </button>
      </form>

      {message && (
        <div
          className="mt-4 p-3 rounded text-sm"
          style={{
            backgroundColor:
              message.type === "success"
                ? "rgba(76, 175, 80, 0.1)"
                : "rgba(244, 67, 54, 0.1)",
            color: message.type === "success" ? "#2E7D32" : "#C62828",
            borderLeft:
              message.type === "success"
                ? "4px solid #4CAF50"
                : "4px solid #F44336",
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
