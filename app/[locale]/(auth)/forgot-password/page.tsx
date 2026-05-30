"use client";

import { useState } from "react";
import { Link } from "@/lib/navigation";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(t("errorOccurred"));
      }

      setSubmitted(true);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorOccurred"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <div className="w-5 h-5 bg-[var(--primary)] rounded-[4px]" />
          <span className="text-sm font-medium text-[var(--text-dark)]">pushlog</span>
        </Link>
      </div>

      <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-soft)] p-8">
        <h1 className="text-2xl font-bold text-[var(--text-dark)] mb-2 font-[family-name:var(--font-display)]">
          {t("forgotPasswordTitle")}
        </h1>
        <p className="text-[var(--text-mid)] mb-6">{t("forgotPasswordSubtitle")}</p>

        {submitted ? (
          <div className="space-y-4">
            <div className="p-4 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg">
              <p className="text-sm text-[var(--text-dark)]">{t("emailSentNotice")}</p>
            </div>
            <div className="pt-4">
              <Link href="/login" className="block text-center text-[var(--primary)] hover:text-[var(--text-mid)] font-medium">
                {t("backToLogin")}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-dark)] mb-2">
                {t("email")}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                required
                className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg text-[var(--text-dark)] placeholder-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            {error && (
              <div className="p-3 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg">
                <p className="text-sm text-[var(--text-mid)]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--primary)] hover:bg-[var(--text-mid)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition mt-6"
            >
              {loading ? t("sending") : t("requestLink")}
            </button>
          </form>
        )}

        {!submitted && (
          <p className="text-center text-[var(--text-mid)] mt-6">
            <Link href="/login" className="text-[var(--primary)] hover:text-[var(--text-mid)] font-medium">
              {t("backToLogin")}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
