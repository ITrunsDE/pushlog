export function canUseFeature(
  plan: string,
  feature: "multiple_products" | "custom_domain" | "widget_pro" | "ai" | "custom_categories" | "white_label"
): boolean {
  const features: Record<string, string[]> = {
    free: [],
    solo: ["ai", "custom_domain"],
    pro: ["ai", "custom_domain", "multiple_products", "widget_pro", "custom_categories", "white_label"],
  };
  return features[plan]?.includes(feature) ?? false;
}

export function getSubscriberLimit(plan: string): number {
  const limits: Record<string, number> = {
    free: 50,
    solo: 500,
    pro: Infinity,
  };
  return limits[plan] ?? 0;
}
