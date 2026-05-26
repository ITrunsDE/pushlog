import { test, expect } from "@playwright/test";

const testUser = {
  email: "test@example.com",
  password: "password123",
  name: "Test User",
};

test.describe("Auth Flows", () => {
  test("1. Registrierung: POST /api/auth/register", async ({ request }) => {
    const newUser = {
      name: "New User",
      email: `new-user-${Date.now()}@example.com`,
      password: "password123",
    };

    const response = await request.post("/api/auth/register", {
      data: newUser,
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test("1a. Registrierung: Fehler bei existierender E-Mail", async ({
    request,
  }) => {
    const response = await request.post("/api/auth/register", {
      data: {
        name: testUser.name,
        email: testUser.email,
        password: testUser.password,
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("bereits registriert");
  });

  test("1b. Registrierung: Fehler bei kurzem Passwort", async ({ request }) => {
    const response = await request.post("/api/auth/register", {
      data: {
        name: "User",
        email: `short-pass-${Date.now()}@example.com`,
        password: "123",
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("mindestens 6 Zeichen");
  });

  test("2. Login: /login Formular → /dashboard", async ({ page }) => {
    await page.goto("/login");

    // Überprüfe, dass Login-Seite geladen wurde
    await expect(page).toHaveURL(/\/login/);

    // Fülle Formular aus (nach name Attribut)
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);

    // Absenden
    await page.click('button[type="submit"]');

    // Warte auf Redirect zu Dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
  });

  test("3. Auth-Guard: /dashboard ohne Session → /login", async ({ page }) => {
    // Gehe direkt zu Dashboard ohne authentifiziert zu sein
    // und lösche Cookies/Session
    await page.context().clearCookies();

    await page.goto("/dashboard");

    // Sollte zu /login weitergeleitet werden
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test("4. Logout: Dashboard Logout-Button → /", async ({ page }) => {
    // Login zuerst
    await page.goto("/login");
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Warte auf Redirect zu Dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });

    // Warte, dass Seite vollständig geladen ist
    await page.waitForLoadState("networkidle");

    // Finde Logout-Button (ist ein <button> mit Text "Logout")
    const logoutButton = page.locator('button:has-text("Logout")');

    // Überprüfe, dass Button sichtbar ist
    await expect(logoutButton).toBeVisible({ timeout: 5000 });

    // Klicke Button
    await logoutButton.click();

    // Sollte zur Startseite weitergeleitet werden
    await expect(page).toHaveURL("/", { timeout: 5000 });
  });
});
