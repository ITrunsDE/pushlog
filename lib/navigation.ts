import { createNavigation } from "next-intl/navigation";

export const locales = ["en", "de"] as const;
export type Locale = (typeof locales)[number];

export const { Link, redirect, useRouter, usePathname } = createNavigation({
  locales,
  defaultLocale: "en",
  localePrefix: "as-needed",
});
