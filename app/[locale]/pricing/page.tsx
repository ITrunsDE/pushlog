import { Link } from "@/lib/navigation";
import { PlanCTAButton } from "./_components/plan-cta";

const COMPARISON_ROWS: { label: string; free: string; solo: string; pro: string }[] = [
  { label: "Price", free: "$0 / mo", solo: "$12 / mo", pro: "$29 / mo" },
  { label: "Products", free: "1", solo: "1", pro: "Multiple" },
  { label: "Changelog entries", free: "25", solo: "Unlimited", pro: "Unlimited" },
  { label: "Subscribers", free: "50", solo: "500", pro: "Unlimited" },
  { label: "AI generation (GPT-4o mini)", free: "5 / month", solo: "✓", pro: "✓" },
  { label: "Email digest", free: "Monthly", solo: "✓", pro: "✓" },
  { label: "Custom domain", free: "–", solo: "✓", pro: "✓" },
  { label: "Widget (badge + popup)", free: "✓", solo: "✓", pro: "✓" },
  { label: "Widget Pro (inline / filters)", free: "–", solo: "–", pro: "✓" },
  { label: "Custom categories", free: "–", solo: "–", pro: "✓" },
  { label: "White-label (no branding)", free: "–", solo: "–", pro: "✓" },
  { label: "Slack integration", free: "–", solo: "–", pro: "✓" },
];

function CellValue({ value }: { value: string }) {
  if (value === "✓") {
    return <span className="text-[var(--primary)] font-medium">✓</span>;
  }
  if (value === "–") {
    return <span className="text-[var(--border-soft)]">–</span>;
  }
  return <span>{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] font-sans">
      <div className="max-w-5xl mx-auto border-x border-[var(--border-soft)]">
        {/* Nav */}
        <nav className="border-b border-[var(--border-soft)] px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[var(--primary)] rounded-[4px]" />
            <span className="text-sm font-medium text-[var(--text-dark)]">pushlog</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-[var(--text-mid)]">
            <Link href="/pricing" className="text-[var(--text-dark)] font-medium">
              Pricing
            </Link>
            <Link href="/blog" className="hover:text-[var(--text-dark)] transition-colors">
              Blog
            </Link>
            <Link href="/login" className="text-[var(--text-dark)] hover:text-[var(--text-mid)] transition-colors">
              Login
            </Link>
            <Link
              href="/register"
              className="border border-[var(--border-strong)] rounded-lg px-3.5 py-1.5 text-xs text-[var(--text-mid)] hover:bg-[var(--surface)] transition-colors"
            >
              Start free
            </Link>
          </div>
        </nav>

        {/* Header */}
        <section className="px-8 py-10 border-b border-[var(--border-soft)] text-center">
          <p className="text-[11px] uppercase tracking-widest text-[var(--primary)] mb-3">
            Pricing
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-[28px] font-medium leading-[1.25] text-[var(--text-dark)] mb-3">
            Simple, honest pricing
          </h1>
          <p className="text-sm text-[var(--text-mid)] max-w-sm mx-auto">
            Start free. Upgrade when you need more. No hidden fees.
          </p>
        </section>

        {/* Plan cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 border-b border-[var(--border-soft)]">
          {/* Free */}
          <div className="px-7 py-8 border-b sm:border-b-0 sm:border-r border-[var(--border-soft)] flex flex-col">
            <p className="text-[11px] uppercase tracking-widest text-[var(--primary)] mb-4">Free</p>
            <div className="mb-1">
              <span className="font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--text-dark)]">
                $0
              </span>
              <span className="text-sm text-[var(--text-mid)] ml-1">/ month</span>
            </div>
            <p className="text-xs text-[var(--text-mid)] mb-6">Get started, no credit card needed.</p>
            <ul className="space-y-2 text-sm text-[var(--text-mid)] mb-8">
              <li>1 product</li>
              <li>25 changelog entries</li>
              <li>50 subscribers</li>
              <li>5 AI generations / month</li>
              <li>Monthly email digest</li>
              <li>Widget (badge + popup)</li>
            </ul>
            <Link
              href="/register"
              className="mt-auto block w-full text-center border border-[var(--border-strong)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-mid)] hover:bg-[var(--surface)] transition-colors"
            >
              Start free
            </Link>
          </div>

          {/* Solo — highlighted */}
          <div className="px-7 py-8 bg-[var(--surface)] border-b sm:border-b-0 sm:border-r border-[var(--border-soft)] relative flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <p className="text-[11px] uppercase tracking-widest text-[var(--primary)]">Solo</p>
              <span className="text-[10px] bg-[var(--primary)] text-[var(--background)] px-2 py-0.5 rounded-full font-medium">
                Recommended
              </span>
            </div>
            <div className="mb-1">
              <span className="font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--text-dark)]">
                $12
              </span>
              <span className="text-sm text-[var(--text-mid)] ml-1">/ month</span>
            </div>
            <p className="text-xs text-[var(--text-mid)] mb-6">For indie hackers shipping solo.</p>
            <ul className="space-y-2 text-sm text-[var(--text-mid)] mb-8">
              <li>1 product</li>
              <li>Unlimited changelog entries</li>
              <li>500 subscribers</li>
              <li>Unlimited AI generation</li>
              <li>Email digest</li>
              <li>Widget (badge + popup)</li>
              <li className="text-[var(--text-dark)] font-medium">Custom domain</li>
            </ul>
            <PlanCTAButton
              plan="solo"
              label="Get Solo"
              className="mt-auto block w-full text-center bg-[var(--primary)] text-[var(--background)] rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[var(--text-mid)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Pro */}
          <div className="px-7 py-8 bg-[var(--text-dark)] flex flex-col">
            <p className="text-[11px] uppercase tracking-widest text-[var(--primary)] mb-4">Pro</p>
            <div className="mb-1">
              <span className="font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--surface)]">
                $29
              </span>
              <span className="text-sm text-[var(--border-soft)] ml-1">/ month</span>
            </div>
            <p className="text-xs text-[var(--primary)] mb-6">For teams with multiple products.</p>
            <ul className="space-y-2 text-sm text-[var(--border-soft)] mb-8">
              <li className="text-[var(--surface)]">Multiple products</li>
              <li>Unlimited everything</li>
              <li>Custom domain</li>
              <li className="text-[var(--surface)]">Widget Pro (inline / filters)</li>
              <li className="text-[var(--surface)]">Custom categories</li>
              <li className="text-[var(--surface)]">White-label</li>
              <li className="text-[var(--surface)]">Slack integration</li>
            </ul>
            <PlanCTAButton
              plan="pro"
              label="Get Pro"
              className="mt-auto block w-full text-center bg-[var(--primary)] text-[var(--background)] rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[var(--text-mid)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </section>

        {/* Comparison table */}
        <section className="border-b border-[var(--border-soft)]">
          <div className="px-6 py-5 border-b border-[var(--border-soft)]">
            <p className="text-[11px] uppercase tracking-widest text-[var(--primary)]">Compare plans</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-soft)]">
                <th className="text-left px-6 py-3 text-xs font-medium text-[var(--text-mid)] w-1/4" />
                <th className="px-6 py-3 text-center text-xs font-medium text-[var(--text-mid)]">Free</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[var(--primary)] bg-[var(--surface)]">
                  Solo
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[var(--border-soft)] bg-[var(--text-dark)]">
                  Pro
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr
                  key={row.label}
                  className="border-b border-[var(--border-soft)]"
                  style={i % 2 !== 0 ? { backgroundColor: "color-mix(in srgb, var(--surface) 30%, transparent)" } : undefined}
                >
                  <td className="px-6 py-3 text-[var(--text-dark)]">{row.label}</td>
                  <td className="px-6 py-3 text-center text-[var(--text-mid)]">
                    <CellValue value={row.free} />
                  </td>
                  <td
                    className="px-6 py-3 text-center text-[var(--text-mid)]"
                    style={{ backgroundColor: "color-mix(in srgb, var(--surface) 50%, transparent)" }}
                  >
                    <CellValue value={row.solo} />
                  </td>
                  <td
                    className="px-6 py-3 text-center text-[var(--text-mid)]"
                    style={{ backgroundColor: "color-mix(in srgb, var(--text-dark) 5%, transparent)" }}
                  >
                    <CellValue value={row.pro} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Footer bar */}
        <footer className="bg-[var(--surface)] px-6 py-3.5 flex items-center gap-6 text-xs text-[var(--text-mid)]">
          <span>✓ Free plan forever</span>
          <span>✓ Cancel anytime</span>
          <span>✓ No setup fees</span>
        </footer>
      </div>
    </div>
  );
}
