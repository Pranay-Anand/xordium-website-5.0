import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#08090c]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-xl font-black text-white">
            XORDIUM <span className="text-red-500">5.0</span>
          </p>
          <p className="mt-2 font-mono text-[11px] leading-relaxed text-white/50">
            Where cybernetic intellect confronts elite esports execution. A week of inter-collegiate competition, showcasing the pinnacle of collegiate esports and intellectual prowess.
          </p>
        </div>
        <div className="font-mono text-[11px] tracking-[0.2em] uppercase">
          <p className="text-white/40">Navigate</p>
          <div className="mt-2 flex flex-col gap-1">
            <Link href="/" className="text-white/70 hover:text-white">
              Base
            </Link>
            <Link href="/events" className="text-white/70 hover:text-white">
              Events directory
            </Link>
            <Link href="/about" className="text-white/70 hover:text-white">
              About
            </Link>
            <Link href="/support" className="text-white/70 hover:text-white">
              Support
            </Link>
          </div>
        </div>
        <div className="font-mono text-[11px]">
          <p className="tracking-[0.2em] text-white/40 uppercase">Comms</p>
          <p className="mt-2 text-white/70">ignite@bitmesra.ac.in</p>
          <p className="text-white/70">Birla Institute of Technology, Patna 800014</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-3 text-center font-mono text-[10px] tracking-[0.25em] text-white/35 uppercase">
        Xordium 5.0 // Year 2026 // All systems nominal
      </div>
    </footer>
  );
}
