import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "sebastian.selig@gmail.com";

export async function GET() {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      createdAt: true,
      _count: {
        select: { products: true },
      },
      products: {
        select: {
          _count: {
            select: {
              entries: true,
              subscribers: {
                where: { confirmedAt: { not: null } },
              },
            },
          },
        },
      },
    },
  });

  return Response.json(users);
}
