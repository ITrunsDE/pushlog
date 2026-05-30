---
name: project-i18n-migration
description: next-intl i18n migration completed — all routes under app/[locale], EN+DE supported
metadata:
  type: project
---

Implemented next-intl i18n with EN + DE support (2026-05-29).

**Why:** Product requirement to support both English and German across Dashboard, Auth pages, and public Changelog.

**How to apply:** When adding new pages or routes, always place them under `app/[locale]/` not directly in `app/`. Use `getTranslations()` in server components and `useTranslations()` in client components. Add new keys to both `messages/en.json` and `messages/de.json`.

Key files:
- `i18n.ts` — next-intl request config (pointed to by `createNextIntlPlugin("./i18n.ts")` in next.config.mjs)
- `lib/navigation.ts` — locale-aware `Link`, `useRouter`, `redirect`, `usePathname`
- `messages/en.json` + `messages/de.json` — translation keys
- `components/locale-switcher.tsx` — switcher placed in dashboard sidebar header
- `middleware.ts` — Auth.js + next-intl combined; handles DE locale dashboard protection
- `localePrefix: "as-needed"` — EN paths have no prefix (`/login`), DE gets `/de/` prefix (`/de/login`)
