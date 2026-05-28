export function canUseFeature(
  plan: string,
  feature: "multiple_products" | "custom_domain" | "widget_pro" | "ai" | "custom_categories"
): boolean {
  const features: Record<string, string[]> = {
    free: [],
    solo: ["ai", "custom_domain"],
    pro: ["ai", "custom_domain", "multiple_products", "widget_pro", "custom_categories"],
  };
  return features[plan]?.includes(feature) ?? false;
}
