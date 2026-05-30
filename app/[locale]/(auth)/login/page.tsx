"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/lib/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get("message") === "password-reset") {
      setShowSuccess(true);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("wrongCredentials"));
        return;
      }

      router.refresh();
      router.push("/dashboard");
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
          {t("welcomeBack")}
        </h1>
        <p className="text-[var(--text-mid)] mb-6">{t("signInToAccount")}</p>

        {showSuccess && (
          <div className="p-3 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg mb-6">
            <p className="text-sm text-[var(--text-dark)]">{t("passwordResetSuccess")}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-dark)] mb-2">
              {t("email")}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t("emailPlaceholder")}
              required
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg text-[var(--text-dark)] placeholder-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-dark)]">
                {t("password")}
              </label>
              <Link href="/forgot-password" className="text-xs text-[var(--primary)] hover:text-[var(--text-mid)] font-medium">
                {t("forgotPassword")}
              </Link>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t("passwordPlaceholder")}
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
            {loading ? t("loggingIn") : t("loginButton")}
          </button>
        </form>

        <p className="text-center text-[var(--text-mid)] mt-6">
          {t("noAccount")}{" "}
          <Link href="/register" className="text-[var(--primary)] hover:text-[var(--text-mid)] font-medium">
            {t("register")}
          </Link>
        </p>
      </div>
    </div>
  );
}
