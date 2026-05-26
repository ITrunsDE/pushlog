"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      const response = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
      });

      if (response.error) {
        setError(response.error.message || "Login fehlgeschlagen");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <div className="w-8 h-8 bg-[#BA7517] rounded-md" />
          <span className="text-xl font-semibold text-[#2C2B28]">pushlog</span>
        </Link>
      </div>

      {/* Card */}
      <div className="bg-[#fef9ee] rounded-lg border border-[#FAC775] p-8">
        <h1 className="text-2xl font-bold text-[#2C2B28] mb-2 font-[family-name:var(--font-display)]">
          Willkommen zurück
        </h1>
        <p className="text-[#633806] mb-6">Loggen Sie sich in Ihr Konto ein</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#2C2B28] mb-2">
              E-Mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ihr@beispiel.de"
              required
              className="w-full px-4 py-2 bg-[#fffdf8] border border-[#FAC775] rounded-lg text-[#2C2B28] placeholder-[#BA7517] focus:outline-none focus:ring-2 focus:ring-[#BA7517]"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#2C2B28] mb-2">
              Passwort
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Ihr Passwort"
              required
              className="w-full px-4 py-2 bg-[#fffdf8] border border-[#FAC775] rounded-lg text-[#2C2B28] placeholder-[#BA7517] focus:outline-none focus:ring-2 focus:ring-[#BA7517]"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#BA7517] hover:bg-[#9a6514] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition mt-6"
          >
            {loading ? "Wird angemeldet..." : "Einloggen"}
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center text-[#633806] mt-6">
          Noch kein Konto?{" "}
          <Link href="/register" className="text-[#BA7517] hover:text-[#9a6514] font-medium">
            Registrieren
          </Link>
        </p>
      </div>
    </div>
  );
}
