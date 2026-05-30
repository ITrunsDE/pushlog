import { Link } from "@/lib/navigation";
import { LogoutButton } from "./logout-button";
import { getTranslations } from "next-intl/server";

interface SidebarUserBlockProps {
  email: string;
  plan: string;
}

const planBadgeConfig = {
  free: { bg: "bg-gray-100", text: "text-gray-600", border: "" },
  solo: { bg: "bg-[var(--surface)]", text: "text-[var(--primary)]", border: "border border-[var(--border-soft)]" },
  pro: { bg: "bg-[var(--text-dark)]", text: "text-[var(--border-soft)]", border: "" },
};

function getInitials(email: string): string {
  return email.charAt(0).toUpperCase();
}

export async function SidebarUserBlock({ email, plan }: SidebarUserBlockProps) {
  const t = await getTranslations("dashboard");
  const config = planBadgeConfig[plan as keyof typeof planBadgeConfig] || planBadgeConfig.free;
  const planLabelMap: Record<string, string> = {
    free: t("freePlan"),
    solo: t("soloPlan"),
    pro: t("proPlan"),
  };
  const planLabel = planLabelMap[plan] || t("freePlan");
  const initials = getInitials(email);

  return (
    <div className="px-6 py-6 border-t border-[var(--border-soft)] space-y-4 flex flex-col">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-xs font-medium">
            {initials}
          </div>
          <span className="text-xs text-[var(--text-mid)] truncate">{email}</span>
        </div>
        <div className={`px-2.5 py-1 rounded text-xs font-medium w-fit ${config.bg} ${config.text} ${config.border}`}>
          {planLabel}
        </div>
      </div>

      {plan !== "pro" && (
        <Link
          href="/dashboard/settings"
          className="w-full px-3 py-2 bg-[var(--primary)] text-white text-xs font-medium rounded-lg hover:bg-[var(--text-mid)] transition-colors text-center"
        >
          {t("upgradeButton")}
        </Link>
      )}

      <LogoutButton />
    </div>
  );
}
