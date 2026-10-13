"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getCurrentUser,
  isAuthenticated,
  logout,
  getCurrentUserFromAPI,
  type AdminUser,
} from "@/lib/admin-api";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", minRole: "MODERATOR" as const },
  { href: "/admin/events", label: "Events", minRole: "MODERATOR" as const },
  { href: "/admin/registrations", label: "Registrations", minRole: "ADMIN" as const },
  { href: "/admin/moderators", label: "Moderators", minRole: "ADMIN" as const },
  { href: "/admin/users", label: "Users", minRole: "OWNER" as const },
];

const ROLE_LEVELS: Record<AdminUser["role"], number> = {
  MODERATOR: 1,
  ADMIN: 2,
  OWNER: 3,
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isLoginRoute = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginRoute) {
      setLoading(false);
      return;
    }

    // First check localStorage for immediate UI
    if (!isAuthenticated()) {
      router.push("/admin/login");
      return;
    }
    setUser(getCurrentUser());

    // Then verify session against the API (httpOnly cookie)
    getCurrentUserFromAPI()
      .then((res) => {
        setUser(res.user);
        setLoading(false);
      })
      .catch(() => {
        // Session invalid - the apiRequest already redirected to login
        setLoading(false);
      });
  }, [pathname, isLoginRoute, router]);

  const handleLogout = async () => {
    await logout();
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
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/admin/dashboard"
              className="font-mono text-sm font-bold tracking-[0.2em] text-white uppercase whitespace-nowrap"
            >
              XORDIUM <span className="text-red-400">//</span> ADMIN
            </Link>
            <div className="flex items-center gap-4">
              <span className="hidden lg:block font-mono text-[11px] text-white/40 uppercase tracking-[0.15em] whitespace-nowrap">
                {user.email} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="font-mono text-[11px] text-white/60 hover:text-white uppercase tracking-[0.15em] transition-colors whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
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
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-4 font-mono text-[10px] text-white/40 uppercase tracking-[0.2em]">
          Xordium Admin Panel v5.0
        </div>
      </footer>
    </div>
  );
}
