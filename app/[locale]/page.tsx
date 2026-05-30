import { Link } from "@/lib/navigation";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="min-h-screen bg-[var(--background)] font-sans">
      <div className="max-w-5xl mx-auto border-x border-[var(--border-soft)]">
      {/* Nav */}
      <nav className="border-b border-[var(--border-soft)] px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[var(--primary)] rounded-[4px]" />
          <span className="text-sm font-medium text-[var(--text-dark)]">pushlog</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-[var(--text-mid)]">
          <Link href="/pricing" className="hover:text-[var(--text-dark)] transition-colors">
            Pricing
          </Link>
          <Link href="/blog" className="hover:text-[var(--text-dark)] transition-colors">
            Blog
          </Link>
          {user ? (
            <Link href="/dashboard" className="text-[var(--text-dark)] hover:text-[var(--text-mid)] transition-colors">
              {user.name ?? user.email}
            </Link>
          ) : (
            <Link href="/login" className="text-[var(--text-dark)] hover:text-[var(--text-mid)] transition-colors">
              Login
            </Link>
          )}
          {!user && (
            <Link
              href="/register"
              className="border border-[var(--border-strong)] rounded-lg px-3.5 py-1.5 text-xs text-[var(--text-mid)] hover:bg-[var(--surface)] transition-colors"
            >
              Start free
            </Link>
          )}
        </div>
      </nav>

      {/* Hero + Live Preview */}
      <section className="grid grid-cols-2 border-b border-[var(--border-soft)]">
        {/* Left: Copy + CTAs */}
        <div className="px-8 py-10 border-r border-[var(--border-soft)]">
          <p className="text-[11px] uppercase tracking-widest text-[var(--primary)] mb-4">
            For indie hackers who ship
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-[28px] font-medium leading-[1.25] text-[var(--text-dark)] mb-4">
            The changelog your
            <br />
            users will actually read
          </h1>
          <p className="text-sm text-[var(--text-mid)] leading-relaxed mb-7 max-w-sm">
            Paste bullet points. AI writes the changelog. Email digest and
            embeddable widget included — published in seconds.
          </p>
          <div className="flex flex-col gap-2.5 items-start">
            <Link
              href="/register"
              className="bg-[var(--primary)] text-[var(--background)] rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-[var(--text-mid)] transition-colors inline-block"
            >
              Start free — no credit card
            </Link>
            <Link
              href="/changelog/demo"
              className="border border-[var(--border-strong)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-mid)] hover:bg-[var(--surface)] transition-colors text-left"
            >
              See live demo ↗
            </Link>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="bg-[var(--surface)] px-6 py-6 flex flex-col gap-3">
          <p className="text-[11px] uppercase tracking-widest text-[var(--primary)] mb-1">
            Live example
          </p>

          {/* Entry 1 */}
          <div className="bg-[var(--background)] border border-[var(--border-soft)] rounded-lg p-4">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm font-medium text-[var(--text-dark)]">AI changelog assistant</span>
              <span className="text-xs text-[var(--text-mid)]">v1.4</span>
            </div>
            <p className="text-[11px] text-[var(--primary)] mb-3">May 30, 2025</p>
            <div className="mb-2.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 mb-1.5">
                ✨ Features
              </span>
              <ul className="space-y-0.5">
                <li className="text-xs text-[var(--text-dark)] pl-2">• Paste bullet points, AI writes the changelog</li>
                <li className="text-xs text-[var(--text-dark)] pl-2">• Email digest sent automatically</li>
              </ul>
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 mb-1.5">
                🐛 Fixes
              </span>
              <ul>
                <li className="text-xs text-[var(--text-dark)] pl-2">• Widget iframe rendering on Safari</li>
              </ul>
            </div>
          </div>

          {/* Entry 2 */}
          <div className="bg-[var(--background)] border border-[var(--border-soft)] rounded-lg p-4 opacity-60">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm font-medium text-[var(--text-dark)]">Widget performance</span>
              <span className="text-xs text-[var(--text-mid)]">v1.3</span>
            </div>
            <p className="text-[11px] text-[var(--primary)] mb-3">May 12, 2025</p>
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 mb-1.5">
                ⚡ Improvements
              </span>
              <ul>
                <li className="text-xs text-[var(--text-dark)] pl-2">• Load time reduced by 40%</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Steps */}
      <section className="grid grid-cols-3 border-b border-[var(--border-soft)]">
        {/* Step 1 */}
        <div className="px-6 py-7 border-r border-[var(--border-soft)]">
          <p className="text-[11px] uppercase tracking-widest text-[var(--primary)] mb-4">
            Step 1
          </p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-3 text-[var(--text-mid)]"
            aria-hidden="true"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          <p className="text-sm font-medium text-[var(--text-dark)] mb-1.5">
            Paste your notes
          </p>
          <p className="text-xs text-[var(--text-mid)] leading-relaxed">
            Raw bullet points, messy Slack messages — whatever you have
          </p>
        </div>

        {/* Step 2 */}
        <div className="px-6 py-7 border-r border-[var(--border-soft)]">
          <p className="text-[11px] uppercase tracking-widest text-[var(--primary)] mb-4">
            Step 2
          </p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-3 text-[var(--text-mid)]"
            aria-hidden="true"
          >
            <path d="M12 3L9.5 9.5L3 12L9.5 14.5L12 21L14.5 14.5L21 12L14.5 9.5Z" />
          </svg>
          <p className="text-sm font-medium text-[var(--text-dark)] mb-1.5">
            AI polishes it
          </p>
          <p className="text-xs text-[var(--text-mid)] leading-relaxed">
            GPT-4o mini turns notes into a clear, user-friendly entry
          </p>
        </div>

        {/* Step 3 */}
        <div className="px-6 py-7">
          <p className="text-[11px] uppercase tracking-widest text-[var(--primary)] mb-4">
            Step 3
          </p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-3 text-[var(--text-mid)]"
            aria-hidden="true"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          <p className="text-sm font-medium text-[var(--text-dark)] mb-1.5">
            Auto-published
          </p>
          <p className="text-xs text-[var(--text-mid)] leading-relaxed">
            Public page, email digest, and widget update automatically
          </p>
        </div>
      </section>

      {/* Footer bar */}
      <footer className="bg-[var(--surface)] border-b border-[var(--border-soft)] px-6 py-3.5 flex items-center gap-6 text-xs text-[var(--text-mid)]">
        <span>✓ Free plan forever</span>
        <span>✓ Custom domain on Solo</span>
        <span>✓ No technical setup</span>
      </footer>
      </div>
    </div>
  );
}
