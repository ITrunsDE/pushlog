# E2E Tests mit Playwright

Playwright E2E Tests für die Auth-Flows der Pushlog Anwendung.

## Setup

### Installation

Dependencies sind bereits installiert (siehe `package.json`). Falls nicht:

```bash
npm install -D @playwright/test
```

### Umgebungsvariablen

Stelle sicher, dass `.env.local` konfiguriert ist:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=... (für local development)
NEXTAUTH_URL=http://localhost:3000
```

## Tests ausführen

### Development Mode (mit Browser-UI)

```bash
npm run test:e2e:ui
```

### Headless Mode (CI)

```bash
npm run test:e2e
```

### Debug Mode (interaktiv)

```bash
npm run test:e2e:debug
```

## Test-Szenarien

### 1. Registrierung (`POST /api/auth/register`)
- ✅ Erfolgreiche Registrierung mit Name, Email, Passwort
- ✅ Fehler bei existierender E-Mail
- ✅ Fehler bei Passwort < 6 Zeichen

### 2. Login (`/login` → `/dashboard`)
- ✅ Login-Formular ausfüllen
- ✅ Credentials werden validiert
- ✅ Redirect zu Dashboard nach erfolgreicher Auth

### 3. Auth-Guard (`/dashboard` ohne Session)
- ✅ Zugriff auf `/dashboard` ohne Session
- ✅ Automatischer Redirect zu `/login`

### 4. Logout (`Dashboard` → `/`)
- ✅ Logout-Button auf Dashboard klicken
- ✅ Redirect zur Startseite
- ✅ Session wird beendet

## Test-User Management

Die Tests verwenden einen automatisierten Test-User, der von `globalSetup` und `globalTeardown` verwaltet wird:

**globalSetup** (vor allen Tests):
- Löscht existierende User mit Test-Email
- Erstellt neuen Test-User in Datenbank
- Basierend auf: `tests/global-setup.ts`

**globalTeardown** (nach allen Tests):
- Löscht Test-User aus Datenbank
- Basierend auf: `tests/global-teardown.ts`

Test-User Credentials:
- Email: `test@example.com`
- Password: `password123`
- Name: `Test User`

## Konfiguration

`playwright.config.ts` Einstellungen:

```typescript
- baseURL: http://localhost:3000
- workers: 1 (für CI, um Flakiness zu vermeiden)
- headless: true (für CI)
- retries: 2 (für CI)
- timeout: 30000ms pro Test
```

## Reports

Nach Test-Ausführung generierte Dateien:

- `playwright-report/` - HTML-Report (öffne mit `npx playwright show-report`)
- `test-results/` - XML-Reports pro Test
- Screenshots und Videos bei Fehlern

## CI Integration

In `.github/workflows/e2e.yml`:

```yaml
- name: Run E2E Tests
  run: npm run test:e2e
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
    NEXTAUTH_URL: http://localhost:3000
```

## Troubleshooting

**Tests schlagen mit "Timeout" fehl:**
- Stelle sicher, dass dev server läuft: `npm run dev`
- Erhöhe Timeout in `playwright.config.ts`

**Test-User wird nicht gelöscht:**
- Prüfe, ob Datenbankverbindung aktiv ist
- Manuelle Löschung: `npx prisma studio`

**Login schlägt fehl:**
- Überprüfe, dass `.env.local` korrekt gesetzt ist
- Prüfe, dass Passwort richtig gehashed wird (bcryptjs)

## Best Practices

1. **Isolierung:** Jeder Test sollte unabhängig laufen können
2. **Determinismus:** Verwende eindeutige Test-User-Emails für Registrierungstests
3. **Cleanup:** Test-User wird automatisch nach allen Tests gelöscht
4. **Explizite Waits:** Nutze `expect(...).toHaveURL()` statt `page.waitForNavigation()`
