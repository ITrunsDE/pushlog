import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Resend } from 'resend'
import { randomBytes } from 'node:crypto'

const ADMIN_EMAIL = 'sebastian.selig@gmail.com'
const resend = new Resend(process.env.RESEND_API_KEY)

async function checkAdmin() {
  const session = await auth()
  return session?.user?.email === ADMIN_EMAIL
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const user = await db.user.findUnique({ where: { id } })
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

  await db.passwordResetToken.deleteMany({ where: { email: user.email } })

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  await db.passwordResetToken.create({
    data: { email: user.email, token, expiresAt },
  })

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@pushlog.io',
    to: user.email,
    subject: 'Dein Pushlog Passwort zurücksetzen',
    html: `<p>Ein Admin hat eine Passwort-Zurücksetzung für dein Konto angefordert.</p><p><a href="${resetUrl}">Passwort zurücksetzen</a></p><p>Dieser Link ist 1 Stunde gültig.</p>`,
  })

  return Response.json({ success: true })
}
