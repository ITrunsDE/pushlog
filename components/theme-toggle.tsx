"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  isLoggedIn?: boolean;
}

export function ThemeToggle({ isLoggedIn = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const cycleTheme = async () => {
    const next =
      theme === "system" ? "light" : theme === "light" ? "dark" : "system";
    setTheme(next);
    if (isLoggedIn) {
      await fetch("/api/user/theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: next }),
      });
    }
  };

  if (!mounted) return <div className="w-7 h-7" />;

  return (
    <button
      onClick={cycleTheme}
      title={`Theme: ${theme}`}
      className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--text-weak)] hover:text-[var(--text-mid)] hover:bg-[var(--border-soft)]/30 transition-colors"
    >
      {theme === "dark" ? (
        <Moon size={15} />
      ) : theme === "light" ? (
        <Sun size={15} />
      ) : (
        <Monitor size={15} />
      )}
    </button>
  );
}
