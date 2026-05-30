import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { theme } = await req.json();
  if (!["light", "dark", "system"].includes(theme)) {
    return Response.json({ error: "Invalid theme" }, { status: 400 });
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { theme },
  });

  return Response.json({ ok: true });
}
