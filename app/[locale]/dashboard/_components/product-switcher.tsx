"use client";

import { useState } from "react";
import { useRouter } from "@/lib/navigation";
import { ChevronDown, Plus } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface ProductSwitcherProps {
  products: Product[];
  activeProduct: Product;
  isPro: boolean;
}

export function ProductSwitcher({ products, activeProduct, isPro }: ProductSwitcherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function switchProduct(id: string) {
    await fetch("/api/products/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id }),
    });
    setOpen(false);
    router.refresh();
  }

  if (products.length <= 1 && !isPro) {
    return (
      <div className="px-3 py-2 text-sm font-medium truncate" style={{ color: "var(--text-dark)" }}>
        {activeProduct.name}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-zinc-950/5 transition-colors"
      >
        <span className="flex-1 truncate text-left" style={{ color: "var(--text-dark)" }}>
          {activeProduct.name}
        </span>
        <ChevronDown className="size-4 shrink-0" style={{ color: "var(--text-mid)" }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border shadow-lg overflow-hidden"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-soft)" }}
          >
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => (p.isActive ? switchProduct(p.id) : undefined)}
                disabled={!p.isActive}
                className={`flex w-full items-center px-3 py-2 text-sm transition-colors ${
                  !p.isActive ? "opacity-40 cursor-not-allowed" : "hover:bg-zinc-950/5"
                }`}
                style={{
                  color: p.id === activeProduct.id ? "var(--primary)" : "var(--text-dark)",
                  fontWeight: p.id === activeProduct.id ? 600 : 400,
                }}
              >
                <span className="flex-1 truncate text-left">{p.name}</span>
                {!p.isActive && (
                  <span className="ml-auto text-xs text-red-500">Gesperrt</span>
                )}
              </button>
            ))}

            {isPro && (
              <>
                <div className="border-t" style={{ borderColor: "var(--border-soft)" }} />
                <button
                  onClick={() => {
                    setOpen(false);
                    router.push("/dashboard/products/new");
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-950/5 transition-colors"
                  style={{ color: "var(--text-mid)" }}
                >
                  <Plus className="size-4" />
                  Neues Produkt
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
