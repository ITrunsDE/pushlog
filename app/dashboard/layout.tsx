import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SidebarUserBlock } from "./_components/sidebar-user-block";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/entries", label: "Einträge" },
  { href: "/dashboard/widget", label: "Widget" },
  { href: "/dashboard/settings", label: "Einstellungen" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  let userPlan = "free";
  if (session?.user?.id) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });
    userPlan = user?.plan || "free";
  }

  return (
    <div className="min-h-screen bg-[#fffdf8]">
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-56 bg-[#fef9ee] border-r border-[#FAC775] flex-col z-40">
        <div className="px-6 py-6 border-b border-[#FAC775]">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-5 h-5 bg-[#BA7517] rounded-[4px]" />
            <span className="text-sm font-medium text-[#412402]">pushlog</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2.5 text-sm text-[#633806] hover:bg-[#FAEEDA] rounded-lg transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {session?.user?.email && <SidebarUserBlock email={session.user.email} plan={userPlan} />}
      </aside>
      <main className="md:ml-56 overflow-auto">
        {children}
      </main>
    </div>
  );
}