// Auth
export interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  expires: string;
}

// API Responses
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Changelog
export type ChangelogCategory = "feature" | "improvement" | "bugfix" | "breaking";

export interface ChangelogEntryWithProduct {
  id: string;
  title: string;
  body: string;
  category: ChangelogCategory;
  publishedAt: Date | null;
  isPublished: boolean;
  createdAt: Date;
  product: {
    id: string;
    name: string;
  };
}

// Plan Types
export type PlanType = "free" | "pro" | "enterprise";

export const PLAN_LIMITS = {
  free: {
    products: 1,
    monthlyEntries: 10,
    storage: 1024 * 1024, // 1MB
  },
  pro: {
    products: 5,
    monthlyEntries: 100,
    storage: 100 * 1024 * 1024, // 100MB
  },
  enterprise: {
    products: Infinity,
    monthlyEntries: Infinity,
    storage: Infinity,
  },
};
