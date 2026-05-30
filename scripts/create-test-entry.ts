import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const product = await db.product.findFirst();
  if (!product) throw new Error("No product found");
  const entry = await db.changelogEntry.create({
    data: {
      productId: product.id,
      title: "E2E Test Release",
      version: "99.0.0",
      isPublished: true,
      publishedAt: new Date(),
      sections: {
        create: [{ type: "feature", items: JSON.stringify(["Automatischer E2E Test"]) }],
      },
    },
  });
  console.log(entry.id);
  await db.$disconnect();
}

main().catch(console.error);
