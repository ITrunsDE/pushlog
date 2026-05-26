"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const navItems = [
    { href: "/dashboard", label: "Neuer Eintrag" },
    { href: "/dashboard/entries", label: "Alle Einträge" },
    { href: "/dashboard/subscribers", label: "Subscriber" },
    { href: "/dashboard/settings", label: "Einstellungen" },
  ];

  return (
    <div className="min-h-screen bg-[#fffdf8] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#fef9ee] border-r border-[#FAC775] flex flex-col">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-[#FAC775]">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-5 h-5 bg-[#BA7517] rounded-[4px]" />
            <span className="text-sm font-medium text-[#412402]">pushlog</span>
          </Link>
        </div>

        {/* Navigation */}
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

        {/* Logout */}
        <div className="px-6 py-6 border-t border-[#FAC775]">
          <button
            onClick={handleLogout}
            className="w-full text-xs text-[#854F0B] hover:text-[#633806] py-2 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
