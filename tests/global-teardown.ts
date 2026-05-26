import { db } from "@/lib/db";

const testUser = {
  email: "test@example.com",
};

async function globalTeardown() {
  console.log("🧹 Global Teardown: Lösche Test-User...");

  try {
    const deleted = await db.user.deleteMany({
      where: { email: testUser.email },
    });

    console.log(`✓ Test-User gelöscht (${deleted.count} Datensätze)`);
  } catch (error) {
    console.error("❌ Fehler beim Löschen des Test-Users:", error);
    process.exit(1);
  }
}

export default globalTeardown;
