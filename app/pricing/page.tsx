import Link from "next/link";
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
    return <span className="text-[#BA7517] font-medium">✓</span>;
  }
  if (value === "–") {
    return <span className="text-[#FAC775]">–</span>;
  }
  return <span>{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#fffdf8] font-sans">
      <div className="max-w-5xl mx-auto border-x border-[#FAC775]">
        {/* Nav */}
        <nav className="border-b border-[#FAC775] px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#BA7517] rounded-[4px]" />
            <span className="text-sm font-medium text-[#412402]">pushlog</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-[#854F0B]">
            <Link href="/pricing" className="text-[#412402] font-medium">
              Pricing
            </Link>
            <Link href="/blog" className="hover:text-[#412402] transition-colors">
              Blog
            </Link>
            <Link href="/login" className="text-[#412402] hover:text-[#633806] transition-colors">
              Login
            </Link>
            <Link
              href="/register"
              className="border border-[#EF9F27] rounded-lg px-3.5 py-1.5 text-xs text-[#633806] hover:bg-[#FAEEDA] transition-colors"
            >
              Start free
            </Link>
          </div>
        </nav>

        {/* Header */}
        <section className="px-8 py-10 border-b border-[#FAC775] text-center">
          <p className="text-[11px] uppercase tracking-widest text-[#BA7517] mb-3">
            Pricing
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-[28px] font-medium leading-[1.25] text-[#2C2B28] mb-3">
            Simple, honest pricing
          </h1>
          <p className="text-sm text-[#633806] max-w-sm mx-auto">
            Start free. Upgrade when you need more. No hidden fees.
          </p>
        </section>

        {/* Plan cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 border-b border-[#FAC775]">
          {/* Free */}
          <div className="px-7 py-8 border-b sm:border-b-0 sm:border-r border-[#FAC775] flex flex-col">
            <p className="text-[11px] uppercase tracking-widest text-[#BA7517] mb-4">Free</p>
            <div className="mb-1">
              <span className="font-[family-name:var(--font-display)] text-3xl font-medium text-[#2C2B28]">
                $0
              </span>
              <span className="text-sm text-[#854F0B] ml-1">/ month</span>
            </div>
            <p className="text-xs text-[#854F0B] mb-6">Get started, no credit card needed.</p>
            <ul className="space-y-2 text-sm text-[#633806] mb-8">
              <li>1 product</li>
              <li>25 changelog entries</li>
              <li>50 subscribers</li>
              <li>5 AI generations / month</li>
              <li>Monthly email digest</li>
              <li>Widget (badge + popup)</li>
            </ul>
            <Link
              href="/register"
              className="mt-auto block w-full text-center border border-[#EF9F27] rounded-lg px-4 py-2.5 text-sm text-[#633806] hover:bg-[#FAEEDA] transition-colors"
            >
              Start free
            </Link>
          </div>

          {/* Solo — highlighted */}
          <div className="px-7 py-8 bg-[#fef9ee] border-b sm:border-b-0 sm:border-r border-[#FAC775] relative flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <p className="text-[11px] uppercase tracking-widest text-[#BA7517]">Solo</p>
              <span className="text-[10px] bg-[#BA7517] text-[#fffdf8] px-2 py-0.5 rounded-full font-medium">
                Recommended
              </span>
            </div>
            <div className="mb-1">
              <span className="font-[family-name:var(--font-display)] text-3xl font-medium text-[#2C2B28]">
                $12
              </span>
              <span className="text-sm text-[#854F0B] ml-1">/ month</span>
            </div>
            <p className="text-xs text-[#854F0B] mb-6">For indie hackers shipping solo.</p>
            <ul className="space-y-2 text-sm text-[#633806] mb-8">
              <li>1 product</li>
              <li>Unlimited changelog entries</li>
              <li>500 subscribers</li>
              <li>Unlimited AI generation</li>
              <li>Email digest</li>
              <li>Widget (badge + popup)</li>
              <li className="text-[#2C2B28] font-medium">Custom domain</li>
            </ul>
            <PlanCTAButton
              plan="solo"
              label="Get Solo"
              className="mt-auto block w-full text-center bg-[#BA7517] text-[#fffdf8] rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[#854F0B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Pro */}
          <div className="px-7 py-8 bg-[#412402] flex flex-col">
            <p className="text-[11px] uppercase tracking-widest text-[#BA7517] mb-4">Pro</p>
            <div className="mb-1">
              <span className="font-[family-name:var(--font-display)] text-3xl font-medium text-[#fef9ee]">
                $29
              </span>
              <span className="text-sm text-[#FAC775] ml-1">/ month</span>
            </div>
            <p className="text-xs text-[#BA7517] mb-6">For teams with multiple products.</p>
            <ul className="space-y-2 text-sm text-[#FAC775] mb-8">
              <li className="text-[#fef9ee]">Multiple products</li>
              <li>Unlimited everything</li>
              <li>Custom domain</li>
              <li className="text-[#fef9ee]">Widget Pro (inline / filters)</li>
              <li className="text-[#fef9ee]">Custom categories</li>
              <li className="text-[#fef9ee]">White-label</li>
              <li className="text-[#fef9ee]">Slack integration</li>
            </ul>
            <PlanCTAButton
              plan="pro"
              label="Get Pro"
              className="mt-auto block w-full text-center bg-[#BA7517] text-[#fffdf8] rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[#854F0B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </section>

        {/* Comparison table */}
        <section className="border-b border-[#FAC775]">
          <div className="px-6 py-5 border-b border-[#FAC775]">
            <p className="text-[11px] uppercase tracking-widest text-[#BA7517]">Compare plans</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#FAC775]">
                <th className="text-left px-6 py-3 text-xs font-medium text-[#854F0B] w-1/4" />
                <th className="px-6 py-3 text-center text-xs font-medium text-[#854F0B]">Free</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[#BA7517] bg-[#fef9ee]">
                  Solo
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[#FAC775] bg-[#412402]">
                  Pro
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr
                  key={row.label}
                  className={`border-b border-[#FAC775] ${i % 2 === 0 ? "" : "bg-[#fef9ee]/30"}`}
                >
                  <td className="px-6 py-3 text-[#2C2B28]">{row.label}</td>
                  <td className="px-6 py-3 text-center text-[#633806]">
                    <CellValue value={row.free} />
                  </td>
                  <td className="px-6 py-3 text-center text-[#633806] bg-[#fef9ee]/50">
                    <CellValue value={row.solo} />
                  </td>
                  <td className="px-6 py-3 text-center text-[#854F0B] bg-[#412402]/5">
                    <CellValue value={row.pro} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Footer bar */}
        <footer className="bg-[#fef9ee] px-6 py-3.5 flex items-center gap-6 text-xs text-[#854F0B]">
          <span>✓ Free plan forever</span>
          <span>✓ Cancel anytime</span>
          <span>✓ No setup fees</span>
        </footer>
      </div>
    </div>
  );
}
