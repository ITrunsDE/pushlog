import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const BASE_URL = "http://localhost:3000";

async function main() {
  // 1. Ersten Produkt finden
  const product = await db.product.findFirst({
    include: { user: true },
  });

  if (!product) {
    console.error("❌ Kein Produkt gefunden");
    process.exit(1);
  }

  console.log(`✓ Produkt gefunden: ${product.name} (${product.slug})`);

  // 2. Test-Eintrag anlegen
  const entry = await db.changelogEntry.create({
    data: {
      productId: product.id,
      title: "E2E Test Release",
      version: "99.0.0",
      isPublished: true,
      publishedAt: new Date(),
      sections: {
        create: [
          {
            type: "feature",
            items: JSON.stringify(["Automatischer E2E Test erfolgreich"]),
          },
          {
            type: "fix",
            items: JSON.stringify(["Test-Bug behoben"]),
          },
        ],
      },
    },
  });

  console.log(`✓ Eintrag erstellt: ${entry.id}`);

  // 3. DB-Check
  const check = await db.changelogEntry.findUnique({
    where: { id: entry.id },
    include: { sections: true },
  });

  console.log(`✓ DB-Check: ${check?.sections.length} Sektionen gefunden`);

  // 4. HTTP-Checks
  console.log("\n--- HTTP Checks ---");

  let widgetOk = false;
  let changelogOk = false;

  try {
    const widgetRes = await fetch(`${BASE_URL}/api/widget/${product.slug}?limit=50`);
    const widgetData = await widgetRes.json();
    const widgetEntry = widgetData.entries?.find((e: { id: string }) => e.id === entry.id);
    widgetOk = !!widgetEntry;
    console.log(
      `Widget API (/api/widget/${product.slug}): ${widgetRes.status} – Eintrag ${widgetOk ? "✓ gefunden" : "❌ NICHT gefunden"}`
    );
  } catch (e) {
    console.log(`Widget API: ❌ Fehler – ${e}`);
  }

  try {
    const changelogRes = await fetch(`${BASE_URL}/en/changelog/${product.slug}`);
    const changelogHtml = await changelogRes.text();
    changelogOk = changelogHtml.includes("E2E Test Release");
    console.log(
      `Öffentliche Seite (/en/changelog/${product.slug}): ${changelogRes.status} – Eintrag ${changelogOk ? "✓ gefunden" : "❌ NICHT gefunden"}`
    );
  } catch (e) {
    console.log(`Öffentliche Seite: ❌ Fehler – ${e}`);
  }

  // 5. Aufräumen
  await db.changelogEntry.delete({ where: { id: entry.id } });
  console.log(`\n✓ Test-Eintrag gelöscht`);

  // 6. Ergebnis
  console.log("\n=== ERGEBNIS ===");
  if (widgetOk && changelogOk) {
    console.log("✅ Alle Checks bestanden");
  } else {
    console.log("❌ Einige Checks fehlgeschlagen");
    if (!widgetOk) console.log("  - Widget API zeigt Eintrag nicht");
    if (!changelogOk) console.log("  - Öffentliche Seite zeigt Eintrag nicht");
    process.exit(1);
  }

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
