import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

const ADMIN_EMAIL = "sebastian.selig@gmail.com";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const targetUser = await db.user.findUnique({ where: { id } });
  if (!targetUser) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const cookieStore = await cookies();
  cookieStore.set("admin-impersonate", id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60,
    path: "/",
  });

  return Response.json({ success: true, userId: id, email: targetUser.email });
}
