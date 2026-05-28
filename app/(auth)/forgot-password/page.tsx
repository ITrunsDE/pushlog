"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
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
        throw new Error("Fehler beim Anfordern des Reset-Links");
      }

      setSubmitted(true);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <div className="w-5 h-5 bg-[#BA7517] rounded-[4px]" />
          <span className="text-sm font-medium text-[#412402]">pushlog</span>
        </Link>
      </div>

      {/* Card */}
      <div className="bg-[#fef9ee] rounded-lg border border-[#FAC775] p-8">
        <h1 className="text-2xl font-bold text-[#2C2B28] mb-2 font-[family-name:var(--font-display)]">
          Passwort zurücksetzen
        </h1>
        <p className="text-[#633806] mb-6">
          Gib deine E-Mail ein, um einen Reset-Link zu erhalten
        </p>

        {submitted ? (
          <div className="space-y-4">
            <div className="p-4 bg-[#fffdf8] border border-[#FAC775] rounded-lg">
              <p className="text-sm text-[#2C2B28]">
                Falls diese E-Mail registriert ist, erhältst du in Kürze einen Link.
              </p>
            </div>
            <div className="pt-4">
              <Link
                href="/login"
                className="block text-center text-[#BA7517] hover:text-[#9a6514] font-medium"
              >
                Zurück zum Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#2C2B28] mb-2">
                E-Mail
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ihr@beispiel.de"
                required
                className="w-full px-4 py-2 bg-[#fffdf8] border border-[#FAC775] rounded-lg text-[#2C2B28] placeholder-[#BA7517] focus:outline-none focus:ring-2 focus:ring-[#BA7517]"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-[#fffdf8] border border-[#FAC775] rounded-lg">
                <p className="text-sm text-[#633806]">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#BA7517] hover:bg-[#9a6514] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition mt-6"
            >
              {loading ? "Wird versendet..." : "Link anfordern"}
            </button>
          </form>
        )}

        {/* Back to Login Link */}
        {!submitted && (
          <p className="text-center text-[#633806] mt-6">
            <Link href="/login" className="text-[#BA7517] hover:text-[#9a6514] font-medium">
              Zurück zum Login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
