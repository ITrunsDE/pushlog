import { db } from "@/lib/db";
import { getSubscriberLimit } from "@/lib/plan";

interface SubscriberSettingsProps {
  productId: string;
  plan: string;
}

export default async function SubscriberSettings({
  productId,
  plan,
}: SubscriberSettingsProps) {
  const subscriberCount = await db.subscriber.count({
    where: {
      productId,
      confirmedAt: { not: null },
    },
  });

  const limit = getSubscriberLimit(plan);
  const percentage = Math.round((subscriberCount / limit) * 100);

  return (
    <div className="rounded-lg p-6 border" style={{ borderColor: "#FAC775" }}>
      <h2
        className="text-lg font-medium mb-4"
        style={{ color: "#412402" }}
      >
        Newsletter-Abonnenten
      </h2>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span style={{ color: "#633806" }} className="text-sm">
              Bestätigte Abonnenten
            </span>
            <span style={{ color: "#BA7517" }} className="text-sm font-medium">
              {subscriberCount} / {limit === Infinity ? "∞" : limit}
            </span>
          </div>

          {limit !== Infinity && (
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: "#FAC775" }}
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

        <div style={{ color: "#854F0B" }} className="text-xs">
          {plan === "free" && (
            <p>
              Kostenlos: Bis zu 50 Abonnenten. <br />
              <a href="/dashboard/settings?upgrade=true" style={{ color: "#BA7517" }} className="underline">
                Auf Solo oder Pro upgraden
              </a>{" "}
              für mehr Platz.
            </p>
          )}
          {plan === "solo" && (
            <p>
              Solo Plan: Bis zu 500 Abonnenten. <br />
              <a href="/dashboard/settings?upgrade=true" style={{ color: "#BA7517" }} className="underline">
                Auf Pro upgraden
              </a>{" "}
              für unbegrenzten Zugang.
            </p>
          )}
          {plan === "pro" && (
            <p>
              Pro Plan: Unbegrenzte Abonnenten. 🎉
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
