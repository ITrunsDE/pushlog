import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const id = process.argv[2];
  if (!id) throw new Error("Usage: delete-test-entry.ts <id>");
  await db.changelogEntry.delete({ where: { id } });
  console.log(`✓ Gelöscht: ${id}`);
  await db.$disconnect();
}

main().catch(console.error);
