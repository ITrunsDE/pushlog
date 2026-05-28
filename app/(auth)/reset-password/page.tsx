"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if no token
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

    // Validate
    if (formData.password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen lang sein");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwörter stimmen nicht überein");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ein Fehler ist aufgetreten");
        return;
      }

      // Redirect to login with success message
      router.push("/login?message=password-reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return null;
  }

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
          Neues Passwort setzen
        </h1>
        <p className="text-[#633806] mb-6">Gib dein neues Passwort ein</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#2C2B28] mb-2">
              Neues Passwort
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mindestens 8 Zeichen"
              required
              className="w-full px-4 py-2 bg-[#fffdf8] border border-[#FAC775] rounded-lg text-[#2C2B28] placeholder-[#BA7517] focus:outline-none focus:ring-2 focus:ring-[#BA7517]"
            />
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#2C2B28] mb-2">
              Passwort bestätigen
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Passwort wiederholen"
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
            {loading ? "Wird gespeichert..." : "Passwort speichern"}
          </button>
        </form>

        {/* Back to Forgot Password Link */}
        <p className="text-center text-[#633806] mt-6">
          <Link href="/forgot-password" className="text-[#BA7517] hover:text-[#9a6514] font-medium">
            Link neu anfordern
          </Link>
        </p>
      </div>
    </div>
  );
}
