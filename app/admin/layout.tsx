"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, isAuthenticated, logout } from "@/lib/admin-api";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", minRole: "moderator" as const },
  { href: "/admin/events", label: "Events", minRole: "moderator" as const },
  { href: "/admin/registrations", label: "Registrations", minRole: "admin" as const },
  { href: "/admin/moderators", label: "Moderators", minRole: "admin" as const },
  { href: "/admin/users", label: "Users", minRole: "owner" as const },
];

const ROLE_LEVELS = {
  moderator: 1,
  admin: 2,
  owner: 3,
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginRoute, setIsLoginRoute] = useState(false);

  useEffect(() => {
    setIsLoginRoute(pathname === "/admin/login");

    if (!isLoginRoute) {
      if (!isAuthenticated()) {
        router.push("/admin/login");
        return;
      }
      setUser(getCurrentUser());
    }
    setLoading(false);
  }, [pathname, isLoginRoute, router]);

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  // Don't wrap the login page - it has its own minimal layout
  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-xs text-white/60 uppercase tracking-[0.2em]">
          Loading...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    const userLevel = ROLE_LEVELS[user.role] || 0;
    const requiredLevel = ROLE_LEVELS[item.minRole] || 0;
    return userLevel >= requiredLevel;
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top navigation bar */}
      <header className="border-b border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard" className="font-mono text-sm font-bold tracking-[0.2em] text-white uppercase">
              XORDIUM // ADMIN
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-mono text-[11px] uppercase tracking-[0.15em] transition-colors ${
                    pathname === item.href
                      ? "text-red-400"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-white/40 uppercase tracking-[0.15em]">
              {user.email} ({user.role})
            </span>
            <button
              onClick={handleLogout}
              className="font-mono text-[11px] text-white/60 hover:text-white uppercase tracking-[0.15em] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-4 font-mono text-[10px] text-white/40 uppercase tracking-[0.2em]">
          Xordium Admin Panel v5.0
        </div>
      </footer>
    </div>
  );
}
