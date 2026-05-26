"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [productName, setProductName] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sessionData = await authClient.getSession();
        if (!sessionData?.data?.user) {
          router.push("/login");
          return;
        }
        setSession(sessionData.data);
        // Fetch user's first product
        const res = await fetch("/api/products/default");
        if (res.ok) {
          const product = await res.json();
          setProductName(product.name);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffdf8] flex items-center justify-center">
        <p className="text-[#633806]">Wird geladen...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const navItems = [
    { href: "/dashboard", label: "Neuer Eintrag", icon: "pen" },
    { href: "/dashboard/entries", label: "Alle Einträge", icon: "list" },
    { href: "/dashboard/subscribers", label: "Subscriber", icon: "users" },
    { href: "/dashboard/settings", label: "Einstellungen", icon: "settings" },
  ];

  const initials = (session.user?.name || "?")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#fffdf8] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#fef9ee] border-r border-[#FAC775] flex flex-col">
        {/* Logo & Product */}
        <div className="px-6 py-6 border-b border-[#FAC775]">
          <Link href="/dashboard" className="flex items-center gap-2 mb-4 hover:opacity-80 transition">
            <div className="w-6 h-6 bg-[#BA7517] rounded-md" />
            <span className="text-sm font-semibold text-[#2C2B28]">pushlog</span>
          </Link>
          {productName && (
            <p className="text-xs text-[#633806] truncate">{productName}</p>
          )}
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

        {/* User Profile */}
        <div className="px-6 py-6 border-t border-[#FAC775]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#FAEEDA] border border-[#EF9F27] flex items-center justify-center">
              <span className="text-xs font-semibold text-[#BA7517]">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#2C2B28] truncate">{session.user?.name}</p>
              <p className="text-[11px] text-[#854F0B] truncate">{session.user?.email}</p>
            </div>
          </div>
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
