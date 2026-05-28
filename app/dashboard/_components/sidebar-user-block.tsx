import Link from "next/link";
import { LogOut } from "lucide-react";
import { LogoutButton } from "./logout-button";

interface SidebarUserBlockProps {
  email: string;
  plan: string;
}

const planBadgeConfig = {
  free: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "",
  },
  solo: {
    bg: "bg-[#FEF9EE]",
    text: "text-[#BA7517]",
    border: "border border-[#FAC775]",
  },
  pro: {
    bg: "bg-[#412402]",
    text: "text-[#FAC775]",
    border: "",
  },
};

const planLabelMap: Record<string, string> = {
  free: "Free Plan",
  solo: "Solo Plan",
  pro: "Pro Plan",
};

function getInitials(email: string): string {
  return email.charAt(0).toUpperCase();
}

export function SidebarUserBlock({ email, plan }: SidebarUserBlockProps) {
  const config = planBadgeConfig[plan as keyof typeof planBadgeConfig] || planBadgeConfig.free;
  const planLabel = planLabelMap[plan as keyof typeof planLabelMap] || "Free Plan";
  const initials = getInitials(email);

  return (
    <div className="px-6 py-6 border-t border-[#FAC775] space-y-4 flex flex-col">
      {/* User Info Block */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#BA7517] text-white rounded-full flex items-center justify-center text-xs font-medium">
            {initials}
          </div>
          <span className="text-xs text-[#633806] truncate">{email}</span>
        </div>
        <div className={`px-2.5 py-1 rounded text-xs font-medium w-fit ${config.bg} ${config.text} ${config.border}`}>
          {planLabel}
        </div>
      </div>

      {/* Upgrade Button (only for non-pro) */}
      {plan !== "pro" && (
        <Link
          href="/dashboard/settings"
          className="w-full px-3 py-2 bg-[#BA7517] text-white text-xs font-medium rounded-lg hover:bg-[#9d6414] transition-colors text-center"
        >
          Upgrade auf Pro
        </Link>
      )}

      {/* Logout Button */}
      <LogoutButton />
    </div>
  );
}
