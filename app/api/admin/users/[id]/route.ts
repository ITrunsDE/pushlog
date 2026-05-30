import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const ADMIN_EMAIL = "sebastian.selig@gmail.com";

async function checkAdmin() {
  const session = await auth();
  return session?.user?.email === ADMIN_EMAIL;
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await db.user.delete({ where: { id } });
  return Response.json({ success: true });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const data: { plan?: string; locked?: boolean } = {};
  if (body.plan !== undefined) data.plan = body.plan;
  if (body.locked !== undefined) data.locked = body.locked;
  const user = await db.user.update({ where: { id }, data });
  return Response.json(user);
}
