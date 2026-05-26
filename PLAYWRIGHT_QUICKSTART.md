# Playwright E2E Tests - Quick Start

## ⚡ Erste Schritte

### 1. Umgebung vorbereiten

```bash
# Dependencies installieren (bereits done)
npm install -D @playwright/test

# .env.local überprüfen (muss DATABASE_URL enthalten)
cat .env.local
```

### 2. Tests ausführen

```bash
# Alle Tests im Headless-Mode (CI)
npm run test:e2e

# Tests mit Browser-UI (Development)
npm run test:e2e:ui

# Debug-Mode mit Step-by-Step Ausführung
npm run test:e2e:debug
```

### 3. Test-Ergebnisse prüfen

```bash
# HTML-Report öffnen
npx playwright show-report
```

## 📋 Was wird getestet?

| Test | Flow | Status |
|------|------|--------|
| Registrierung | POST /api/auth/register | ✅ API-Test |
| Login | /login → /dashboard | ✅ Browser-Test |
| Auth-Guard | /dashboard ohne Session → /login | ✅ Browser-Test |
| Logout | Dashboard → / | ✅ Browser-Test |

## 🔧 Automatisches Setup

**Vor Tests:**
- `global-setup.ts` erstellt Test-User in DB
- Email: `test@example.com`
- Passwort: `password123`

**Nach Tests:**
- `global-teardown.ts` löscht Test-User

## 📁 Dateistruktur

```
tests/
├── auth.spec.ts          # 4 Test-Suites
├── global-setup.ts       # Vor Tests: Test-User erstellen
├── global-teardown.ts    # Nach Tests: Cleanup
├── fixtures/
│   └── test-user.ts      # Helper (optional)
└── README.md             # Ausführliche Dokumentation

playwright.config.ts      # Konfiguration
```

## 🐛 Häufige Probleme

**Problem: Tests timeout**
```
→ Dev-Server läuft nicht: npm run dev
→ Datenbank nicht erreichbar: DATABASE_URL prüfen
```

**Problem: Login schlägt fehl**
```
→ NEXTAUTH_SECRET in .env.local?
→ Passwort-Hash stimmt nicht → Nutze npm run test:e2e:debug
```

**Problem: Logout-Button wird nicht gefunden**
```
→ Dashboard Layout muss "Logout" Button enthalten
→ Prüfe: app/dashboard/layout.tsx
```

## ✅ Validierung vor Commit

```bash
# 1. Alle Tests sollten grün sein
npm run test:e2e

# 2. Keine Fehler im Playwright Report
npx playwright show-report

# 3. Keine Flaky Tests (mehrfach durchführen)
npm run test:e2e
npm run test:e2e
```

## 🚀 CI/CD Integration (Optional)

Für GitHub Actions (`.github/workflows/e2e.yml`):

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:e2e
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
```

## 📚 Weitere Ressourcen

- [Playwright Docs](https://playwright.dev)
- [Tests README](./tests/README.md) - Ausführliche Dokumentation
- Auth.js Middleware: `middleware.ts`
- Auth Konfiguration: `lib/auth/index.ts`
