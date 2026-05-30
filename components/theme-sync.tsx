"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function ThemeSync({ theme }: { theme: string }) {
  const { setTheme } = useTheme();

  // Run once on mount to load the user's saved theme from the DB.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setTheme(theme); }, []);

  return null;
}
