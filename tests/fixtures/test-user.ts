import { db } from "@/lib/db";
import { hash } from "bcryptjs";

export const testUser = {
  email: "test@example.com",
  password: "password123",
  name: "Test User",
  hashedPassword: "",
};

export async function createTestUser() {
  testUser.hashedPassword = await hash(testUser.password, 10);

  // Entferne bestehenden Test-User falls vorhanden
  await db.user.deleteMany({
    where: { email: testUser.email },
  });

  // Erstelle neuen Test-User
  return db.user.create({
    data: {
      name: testUser.name,
      email: testUser.email,
      password: testUser.hashedPassword,
    },
  });
}

export async function deleteTestUser() {
  return db.user.deleteMany({
    where: { email: testUser.email },
  });
}
