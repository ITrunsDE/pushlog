export function canUseFeature(
  plan: string,
  feature: "multiple_products" | "custom_domain" | "widget_pro" | "ai"
): boolean {
  const features: Record<string, string[]> = {
    free: [],
    solo: ["ai", "custom_domain"],
    pro: ["ai", "custom_domain", "multiple_products", "widget_pro"],
  };
  return features[plan]?.includes(feature) ?? false;
}
