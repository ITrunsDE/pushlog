"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/lib/navigation";
import { useTranslations } from "next-intl";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push("/forgot-password");
    }
  }, [token, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (formData.password.length < 8) {
      setError(t("passwordTooShort"));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: formData.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("errorOccurred"));
        return;
      }

      router.push("/login?message=password-reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorOccurred"));
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

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
          {t("resetPasswordTitle")}
        </h1>
        <p className="text-[var(--text-mid)] mb-6">{t("resetPasswordSubtitle")}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-dark)] mb-2">
              {t("newPassword")}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t("passwordMinReset")}
              required
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg text-[var(--text-dark)] placeholder-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-dark)] mb-2">
              {t("confirmPassword")}
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder={t("repeatPassword")}
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
            {loading ? t("savingPassword") : t("savePassword")}
          </button>
        </form>

        <p className="text-center text-[var(--text-mid)] mt-6">
          <Link href="/forgot-password" className="text-[var(--primary)] hover:text-[var(--text-mid)] font-medium">
            {t("requestNewLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
