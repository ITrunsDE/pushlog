import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const ADMIN_EMAIL = 'sebastian.selig@gmail.com'

async function checkAdmin() {
  const session = await auth()
  return session?.user?.email === ADMIN_EMAIL
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  await db.subscriber.delete({ where: { id } })
  return Response.json({ success: true })
}
