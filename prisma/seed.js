const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  let user = await prisma.user.findFirst({
    where: { email: "test@example.com" },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "test@example.com",
        name: "Test User",
        password: "hashed_password_test",
        plan: "pro",
      },
    });
    console.log("Created test user:", user.id);
  } else {
    console.log("Test user already exists:", user.id);
  }

  let product = await prisma.product.findFirst({
    where: { slug: "test" },
  });

  if (!product) {
    product = await prisma.product.create({
      data: {
        userId: user.id,
        name: "Test Product",
        slug: "test",
        widgetColor: "#BA7517",
      },
    });
    console.log("Created product:", product.id);

    const entry = await prisma.changelogEntry.create({
      data: {
        productId: product.id,
        title: "Initial Release",
        body: "Welcome to our first changelog entry!",
        category: "New",
        isPublished: true,
        publishedAt: new Date(),
      },
    });
    console.log("Created entry:", entry.id);
  } else {
    console.log("Product already exists:", product.id);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
