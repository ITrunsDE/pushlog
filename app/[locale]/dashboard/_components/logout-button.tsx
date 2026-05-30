"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

export function LogoutButton() {
  const t = useTranslations("dashboard");
  return (
    <button
      onClick={() => signOut({ redirectTo: "/" })}
      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-[var(--text-mid)] hover:bg-[var(--surface)] rounded-lg transition-colors"
    >
      <LogOut className="w-4 h-4" />
      <span>{t("logout")}</span>
    </button>
  );
}
