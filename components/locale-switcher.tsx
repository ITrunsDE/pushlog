"use client";

import { useLocale } from "next-intl";
import { usePathname } from "@/lib/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const next = locale === "en" ? "de" : "en";

  function switchLocale() {
    window.location.href = next === "de" ? `/de${pathname}` : pathname;
  }

  return (
    <button
      onClick={switchLocale}
      className="text-xs text-[var(--primary)] hover:text-[var(--text-mid)] font-medium transition-colors"
    >
      {next.toUpperCase()}
    </button>
  );
}
