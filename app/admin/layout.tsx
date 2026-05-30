import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from './_components/admin-sidebar'
import { SidebarLayout } from './_components/ui/sidebar-layout'

const ADMIN_EMAIL = 'sebastian.selig@gmail.com'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    redirect('/login')
  }

  return (
    <html lang="de">
      <body>
        <SidebarLayout navbar={<div />} sidebar={<AdminSidebar />}>
          {children}
        </SidebarLayout>
      </body>
    </html>
  )
}
