import { db } from "@/lib/db";
import { getSubscriberLimit } from "@/lib/plan";
import { getTranslations } from "next-intl/server";

interface SubscriberSettingsProps {
  productId: string;
  plan: string;
}

export default async function SubscriberSettings({
  productId,
  plan,
}: SubscriberSettingsProps) {
  const t = await getTranslations("dashboard");

  const subscriberCount = await db.subscriber.count({
    where: {
      productId,
      confirmedAt: { not: null },
    },
  });

  const limit = getSubscriberLimit(plan);
  const percentage = Math.round((subscriberCount / limit) * 100);

  return (
    <div className="rounded-lg p-6 border" style={{ borderColor: "var(--border-soft)" }}>
      <h2
        className="text-lg font-medium mb-4"
        style={{ color: "var(--text-dark)" }}
      >
        {t("newsletterSubscribers")}
      </h2>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span style={{ color: "var(--text-mid)" }} className="text-sm">
              {t("confirmedSubscribers")}
            </span>
            <span style={{ color: "var(--primary)" }} className="text-sm font-medium">
              {subscriberCount} / {limit === Infinity ? "∞" : limit}
            </span>
          </div>

          {limit !== Infinity && (
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: "var(--border-soft)" }}
            >
              <div
                className="h-full transition-all"
                style={{
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: percentage > 80 ? "#E91E63" : "#4CAF50",
                }}
              />
            </div>
          )}
        </div>

        <div style={{ color: "var(--text-mid)" }} className="text-xs">
          {plan === "free" && (
            <p>
              {t("freePlanSubscribersInfo")} <br />
              <a href="/dashboard/settings?upgrade=true" style={{ color: "var(--primary)" }} className="underline">
                {t("upgradeSoloOrPro")}
              </a>{" "}
              {t("forMoreSpace")}
            </p>
          )}
          {plan === "solo" && (
            <p>
              {t("soloPlanSubscribersInfo")} <br />
              <a href="/dashboard/settings?upgrade=true" style={{ color: "var(--primary)" }} className="underline">
                {t("upgradeToPro")}
              </a>{" "}
              {t("forUnlimitedAccess")}
            </p>
          )}
          {plan === "pro" && (
            <p>
              {t("proPlanSubscribersInfo")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
