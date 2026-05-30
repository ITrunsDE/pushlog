"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

interface PlanCTAButtonProps {
  plan: "solo" | "pro";
  className: string;
  label: string;
}

export function PlanCTAButton({ plan, className, label }: PlanCTAButtonProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  if (!session) {
    return (
      <Link href="/register" className={className}>
        {label}
      </Link>
    );
  }

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? "Loading..." : label}
    </button>
  );
}
