import Link from "next/link";
import { auth } from "@/lib/auth";
import { LogoutButton } from "./_components/logout-button";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/entries", label: "Einträge" },
  { href: "/dashboard/settings", label: "Einstellungen" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#fffdf8] flex">
      <aside className="w-56 bg-[#fef9ee] border-r border-[#FAC775] flex flex-col">
        <div className="px-6 py-6 border-b border-[#FAC775]">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-5 h-5 bg-[#BA7517] rounded-[4px]" />
            <span className="font-display text-sm font-medium text-[#412402]">pushlog</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1">
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
        <div className="px-6 py-6 border-t border-[#FAC775]">
          <p className="text-xs text-[#633806] mb-2">{session?.user?.email}</p>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}