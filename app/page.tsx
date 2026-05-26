import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fffdf8] font-sans">
      <div className="max-w-5xl mx-auto border-x border-[#FAC775]">
      {/* Nav */}
      <nav className="border-b border-[#FAC775] px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#BA7517] rounded-[4px]" />
          <span className="text-sm font-medium text-[#412402]">pushlog</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-[#854F0B]">
          <Link href="/pricing" className="hover:text-[#412402] transition-colors">
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

      {/* Hero + Live Preview */}
      <section className="grid grid-cols-2 border-b border-[#FAC775]">
        {/* Left: Copy + CTAs */}
        <div className="px-8 py-10 border-r border-[#FAC775]">
          <p className="text-[11px] uppercase tracking-widest text-[#BA7517] mb-4">
            For indie hackers who ship
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-[28px] font-medium leading-[1.25] text-[#2C2B28] mb-4">
            The changelog your
            <br />
            users will actually read
          </h1>
          <p className="text-sm text-[#633806] leading-relaxed mb-7 max-w-sm">
            Paste bullet points. AI writes the changelog. Email digest and
            embeddable widget included — published in seconds.
          </p>
          <div className="flex flex-col gap-2.5 items-start">
            <Link
              href="/register"
              className="bg-[#BA7517] text-[#fffdf8] rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[#854F0B] transition-colors inline-block"
            >
              Start free — no credit card
            </Link>
            <Link
              href="/changelog/demo"
              className="border border-[#EF9F27] rounded-lg px-4 py-2.5 text-sm text-[#854F0B] hover:bg-[#FAEEDA] transition-colors text-left"
            >
              See live demo ↗
            </Link>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="bg-[#fef9ee] px-6 py-6 flex flex-col gap-3">
          <p className="text-[11px] uppercase tracking-widest text-[#BA7517] mb-1">
            Live example
          </p>

          {/* Entry 1 */}
          <div className="bg-[#fffdf8] border border-[#FAC775] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="bg-[#085041] text-[#9FE1CB] text-[10px] font-medium px-2.5 py-0.5 rounded-full">
                New
              </span>
              <span className="text-sm font-medium text-[#2C2B28]">
                AI changelog assistant
              </span>
            </div>
            <p className="text-xs text-[#633806] leading-relaxed">
              Paste your bullet points and get a polished changelog in seconds.
              Powered by GPT-4o mini.
            </p>
            <p className="text-[11px] text-[#BA7517] mt-2.5">May 2025 · 3 min read</p>
          </div>

          {/* Entry 2 */}
          <div className="bg-[#fffdf8] border border-[#FAC775] rounded-lg p-4 opacity-65">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#FAEEDA] text-[#633806] text-[10px] px-2.5 py-0.5 rounded-full">
                Fix
              </span>
              <span className="text-sm font-medium text-[#2C2B28]">
                Widget performance
              </span>
            </div>
            <p className="text-xs text-[#633806] leading-relaxed">
              Reduced load time by 40% on the embeddable widget.
            </p>
          </div>

          {/* Entry 3 */}
          <div className="bg-[#fffdf8] border border-[#FAC775] rounded-lg p-4 opacity-35">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#085041] text-[#9FE1CB] text-[10px] px-2.5 py-0.5 rounded-full">
                Improved
              </span>
              <span className="text-sm font-medium text-[#2C2B28]">
                Email digest design
              </span>
            </div>
            <p className="text-xs text-[#633806] leading-relaxed">
              New template, better open rates.
            </p>
          </div>
        </div>
      </section>

      {/* 3 Steps */}
      <section className="grid grid-cols-3 border-b border-[#FAC775]">
        {/* Step 1 */}
        <div className="px-6 py-7 border-r border-[#FAC775]">
          <p className="text-[11px] uppercase tracking-widest text-[#BA7517] mb-4">
            Step 1
          </p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2C2B28"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-3"
            aria-hidden="true"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          <p className="text-sm font-medium text-[#2C2B28] mb-1.5">
            Paste your notes
          </p>
          <p className="text-xs text-[#854F0B] leading-relaxed">
            Raw bullet points, messy Slack messages — whatever you have
          </p>
        </div>

        {/* Step 2 */}
        <div className="px-6 py-7 border-r border-[#FAC775]">
          <p className="text-[11px] uppercase tracking-widest text-[#BA7517] mb-4">
            Step 2
          </p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2C2B28"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-3"
            aria-hidden="true"
          >
            <path d="M12 3L9.5 9.5L3 12L9.5 14.5L12 21L14.5 14.5L21 12L14.5 9.5Z" />
          </svg>
          <p className="text-sm font-medium text-[#2C2B28] mb-1.5">
            AI polishes it
          </p>
          <p className="text-xs text-[#854F0B] leading-relaxed">
            GPT-4o mini turns notes into a clear, user-friendly entry
          </p>
        </div>

        {/* Step 3 */}
        <div className="px-6 py-7">
          <p className="text-[11px] uppercase tracking-widest text-[#BA7517] mb-4">
            Step 3
          </p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2C2B28"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-3"
            aria-hidden="true"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          <p className="text-sm font-medium text-[#2C2B28] mb-1.5">
            Auto-published
          </p>
          <p className="text-xs text-[#854F0B] leading-relaxed">
            Public page, email digest, and widget update automatically
          </p>
        </div>
      </section>

      {/* Footer bar */}
      <footer className="bg-[#fef9ee] px-6 py-3.5 flex items-center gap-6 text-xs text-[#854F0B]">
        <span>✓ Free plan forever</span>
        <span>✓ Custom domain on Solo</span>
        <span>✓ No technical setup</span>
      </footer>
      </div>
    </div>
  );
}