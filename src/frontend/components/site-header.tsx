import Link from "next/link";

const links = [
  { href: "/", label: "Base" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About" },
  { href: "/support", label: "Support" },
  { href: "/admin", label: "Admin" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[var(--color-dracula-bg)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="bg-[var(--color-dracula-red)] px-2 py-1 font-display text-sm font-black tracking-wider text-[var(--color-dracula-bg)]">
            XORDIUM
          </span>
          <span className="font-display text-sm font-black text-[var(--color-dracula-fg)]">
            5.0
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-2 py-1 font-mono text-[11px] tracking-[0.2em] text-[var(--color-dracula-comment)] uppercase transition hover:bg-[var(--color-dracula-current)] hover:text-[var(--color-dracula-fg)] sm:px-3"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/register"
            className="ml-1 hidden bg-[var(--color-dracula-red)] px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.15em] text-[var(--color-dracula-bg)] uppercase hover:bg-[var(--color-dracula-pink)] sm:inline"
          >
            Register →
          </Link>
        </nav>
      </div>
    </header>
  );
}
