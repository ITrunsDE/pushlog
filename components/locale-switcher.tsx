"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const next = locale === "en" ? "de" : "en";

  return (
    <button
      onClick={() => router.replace(pathname, { locale: next })}
      className="text-xs text-[var(--primary)] hover:text-[var(--text-mid)] font-medium transition-colors"
    >
      {next.toUpperCase()}
    </button>
  );
}
