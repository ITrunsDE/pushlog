import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from './_components/admin-sidebar'
import { SidebarLayout } from './_components/ui/sidebar-layout'
import '../globals.css'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import { ThemeProvider } from 'next-themes'

const ADMIN_EMAIL = 'sebastian.selig@gmail.com'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'block',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'block',
})

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    redirect('/login')
  }

  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarLayout navbar={<div />} sidebar={<AdminSidebar />}>
            {children}
          </SidebarLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}
