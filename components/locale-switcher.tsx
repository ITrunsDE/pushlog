"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/lib/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const next = locale === "en" ? "de" : "en";

  return (
    <Link
      href={pathname}
      locale={next}
      className="text-xs text-[var(--primary)] hover:text-[var(--text-mid)] font-medium transition-colors"
    >
      {next.toUpperCase()}
    </Link>
  );
}
