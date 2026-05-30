import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.email !== 'sebastian.selig@gmail.com') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  await db.changelogEntry.delete({ where: { id } })
  return Response.json({ ok: true })
}
