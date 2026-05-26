import { db } from "@/lib/db";
import { hash } from "bcryptjs";

const testUser = {
  email: "test@example.com",
  password: "password123",
  name: "Test User",
};

async function globalSetup() {
  console.log("🔧 Global Setup: Erstelle Test-User...");

  try {
    // Lösche existierenden Test-User
    await db.user.deleteMany({
      where: { email: testUser.email },
    });
    console.log(`✓ Existierender Test-User gelöscht`);

    // Erstelle neuen Test-User
    const hashedPassword = await hash(testUser.password, 10);

    const user = await db.user.create({
      data: {
        name: testUser.name,
        email: testUser.email,
        password: hashedPassword,
      },
    });

    console.log(`✓ Test-User erstellt: ${testUser.email}`);
    return { testUserId: user.id };
  } catch (error) {
    console.error("❌ Fehler beim Erstellen des Test-Users:", error);
    process.exit(1);
  }
}

export default globalSetup;
