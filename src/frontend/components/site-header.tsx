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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0c10]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="bg-red-600 px-2 py-1 font-display text-sm font-black tracking-wider text-white">
            XORDIUM
          </span>
          <span className="font-display text-sm font-black text-white">
            5.0
          </span>
          <span className="hidden font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase sm:inline">
            // BIT Arena
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-2 py-1 font-mono text-[11px] tracking-[0.2em] text-white/60 uppercase transition hover:bg-white/10 hover:text-white sm:px-3"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/register"
            className="ml-1 hidden bg-red-600 px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.15em] text-white uppercase hover:bg-red-500 sm:inline"
          >
            Register →
          </Link>
        </nav>
      </div>
    </header>
  );
}
