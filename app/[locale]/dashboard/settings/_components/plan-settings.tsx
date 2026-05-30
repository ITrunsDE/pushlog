"use client";

import { useState, useEffect } from "react";
import type { User } from "@prisma/client";
import { useTranslations } from "next-intl";

interface PlanSettingsProps {
  user: User;
}

const PLANS = {
  solo: { name: "Solo", price: "€12", color: "bg-amber-100 text-amber-900 border-amber-300" },
  pro: { name: "Pro", price: "€29", color: "bg-gray-800 text-white border-gray-800" },
  free: { name: "Free", price: "€0", color: "bg-gray-100 text-gray-800 border-gray-300" },
};

export default function PlanSettings({ user }: PlanSettingsProps) {
  const t = useTranslations("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const currentPlan = (user.plan || "free") as keyof typeof PLANS;
  const planInfo = PLANS[currentPlan];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setShowSuccessMessage(true);
      window.history.replaceState({}, "", "/dashboard/settings");
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, []);

  const handleUpgrade = async (plan: "solo" | "pro") => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("genericError"));
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("genericError"));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async (targetPlan: "solo" | "pro") => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPlan }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("genericError"));
      }

      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("genericError"));
    } finally {
      setLoading(false);
    }
  };

  const handleManagePlan = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("genericError"));
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-lg p-6 border"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-soft)" }}
    >
      <h2 className="text-xl font-medium text-[var(--text-dark)] mb-6">{t("planTitle")}</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--text-dark)] mb-2">
          {t("currentPlan")}
        </label>
        <div
          className={`inline-flex items-center px-4 py-2 rounded-lg border font-medium ${planInfo.color}`}
        >
          {planInfo.name} • {planInfo.price}{t("perMonth")}
        </div>
      </div>

      {showSuccessMessage && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-6">
          <p className="text-sm text-green-700">{t("planChangedSuccess")}</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {currentPlan === "free" && (
        <div className="space-y-3">
          <button
            onClick={() => handleUpgrade("solo")}
            disabled={loading}
            className="w-full bg-amber-100 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed text-amber-900 font-medium py-2.5 rounded-lg transition border border-amber-300"
          >
            {loading ? t("loading") : t("upgradeToSoloPrice")}
          </button>
          <button
            onClick={() => handleUpgrade("pro")}
            disabled={loading}
            className="w-full bg-gray-800 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition"
          >
            {loading ? t("loading") : t("upgradeToProPrice")}
          </button>
        </div>
      )}

      {currentPlan === "solo" && (
        <div className="space-y-3">
          <button
            onClick={() => handleChangePlan("pro")}
            disabled={loading}
            className="w-full bg-gray-800 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition"
          >
            {loading ? t("loading") : t("upgradeToProPrice")}
          </button>
          <button
            onClick={handleManagePlan}
            disabled={loading}
            className="w-full bg-[var(--background)] hover:bg-[var(--surface)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text-dark)] font-medium py-2.5 rounded-lg transition border border-[var(--border-soft)]"
          >
            {loading ? t("loading") : t("managePlan")}
          </button>
        </div>
      )}

      {currentPlan === "pro" && (
        <div className="space-y-3">
          <button
            onClick={() => handleChangePlan("solo")}
            disabled={loading}
            className="w-full bg-[var(--background)] hover:bg-[var(--surface)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text-dark)] font-medium py-2.5 rounded-lg transition border border-[var(--border-soft)]"
          >
            {loading ? t("loading") : t("downgradeToSoloPrice")}
          </button>
          <button
            onClick={handleManagePlan}
            disabled={loading}
            className="w-full bg-[var(--background)] hover:bg-[var(--surface)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text-dark)] font-medium py-2.5 rounded-lg transition border border-[var(--border-soft)]"
          >
            {loading ? t("loading") : t("managePlan")}
          </button>
        </div>
      )}
    </div>
  );
}
