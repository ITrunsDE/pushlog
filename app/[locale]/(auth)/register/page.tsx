"use client";

import { useState } from "react";
import { Link, useRouter } from "@/lib/navigation";
import { signIn } from "next-auth/react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          turnstileToken,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || t("registrationFailed"));
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorOccurred"));
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
          {t("createAccountTitle")}
        </h1>
        <p className="text-[var(--text-mid)] mb-6">{t("startWithPushlog")}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[var(--text-dark)] mb-2">
              {t("name")}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t("namePlaceholder")}
              required
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg text-[var(--text-dark)] placeholder-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

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
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-dark)] mb-2">
              {t("password")}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t("passwordMinChars")}
              required
              className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-soft)] rounded-lg text-[var(--text-dark)] placeholder-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div className="flex justify-center my-4">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken(null)}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !turnstileToken}
            className="w-full bg-[var(--primary)] hover:bg-[var(--text-mid)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition mt-6"
          >
            {loading ? t("creating") : t("register")}
          </button>
        </form>

        <p className="text-center text-[var(--text-mid)] mt-6">
          {t("hasAccount")}{" "}
          <Link href="/login" className="text-[var(--primary)] hover:text-[var(--text-mid)] font-medium">
            {t("login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
