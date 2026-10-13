"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getCurrentUser,
  fetchUsers,
  fetchModerators,
  fetchRegistrations,
  hasRole,
} from "@/lib/admin-api";

export default function AdminDashboard() {
  const user = getCurrentUser();
  const [userCount, setUserCount] = useState<number | null>(null);
  const [moderatorCount, setModeratorCount] = useState<number | null>(null);
  const [registrationCount, setRegistrationCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const promises: Promise<void>[] = [];

      if (hasRole("OWNER")) {
        promises.push(
          fetchUsers()
            .then((users) => setUserCount(users.length))
            .catch(() => setUserCount(0))
        );
      }

      if (hasRole("ADMIN")) {
        promises.push(
          fetchModerators()
            .then((mods) => setModeratorCount(mods.length))
            .catch(() => setModeratorCount(0))
        );

        promises.push(
          fetchRegistrations()
            .then((regs) => setRegistrationCount(regs.length))
            .catch(() => setRegistrationCount(0))
        );
      }

      await Promise.all(promises);
      setLoading(false);
    }

    loadStats();
  }, []);

  if (!user) return null;

  const statCards = [
    hasRole("OWNER") && userCount !== null && {
      label: "Total Users",
      value: userCount.toString(),
      href: "/admin/users",
    },
    hasRole("ADMIN") && moderatorCount !== null && {
      label: "Moderators",
      value: moderatorCount.toString(),
      href: "/admin/moderators",
    },
    hasRole("ADMIN") && registrationCount !== null && {
      label: "Registrations",
      value: registrationCount.toString(),
      href: "/admin/registrations",
    },
    {
      label: "Your Role",
      value: user.role,
      href: null,
    },
  ].filter(Boolean) as { label: string; value: string; href: string | null }[];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-mono text-2xl font-bold tracking-[0.2em] text-white uppercase">
          // DASHBOARD
        </h1>
        <p className="mt-2 font-mono text-[11px] text-white/40 uppercase tracking-[0.2em]">
          Welcome back, {user.email}
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="border border-white/10 bg-white/5 p-4 rounded animate-pulse"
            >
              <div className="h-3 bg-white/10 rounded w-24 mb-2"></div>
              <div className="h-8 bg-white/10 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <Link
              key={card.label}
              href={card.href || "#"}
              className={`border border-white/10 bg-white/5 p-4 rounded transition-colors ${
                card.href
                  ? "hover:border-red-500/50 hover:bg-white/10"
                  : "cursor-default"
              }`}
            >
              <p className="font-mono text-[10px] text-white/50 uppercase tracking-[0.2em] mb-1">
                {card.label}
              </p>
              <p className="font-mono text-2xl font-bold text-white">{card.value}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-white/10 bg-white/5 p-6 rounded">
          <h3 className="font-mono text-sm font-bold text-white uppercase tracking-[0.2em] mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              href="/admin/events"
              className="block w-full border border-white/20 bg-white/5 py-2.5 px-4 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white hover:bg-white/10 transition-colors text-center"
            >
              Manage Events →
            </Link>
            {hasRole("ADMIN") && (
              <Link
                href="/admin/moderators"
                className="block w-full border border-white/20 bg-white/5 py-2.5 px-4 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white hover:bg-white/10 transition-colors text-center"
              >
                Manage Moderators →
              </Link>
            )}
            {hasRole("OWNER") && (
              <Link
                href="/admin/users"
                className="block w-full border border-white/20 bg-white/5 py-2.5 px-4 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white hover:bg-white/10 transition-colors text-center"
              >
                Manage Users →
              </Link>
            )}
            {hasRole("ADMIN") && (
              <Link
                href="/admin/registrations"
                className="block w-full border border-white/20 bg-white/5 py-2.5 px-4 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white hover:bg-white/10 transition-colors text-center"
              >
                View Registrations →
              </Link>
            )}
          </div>
        </div>

        <div className="border border-white/10 bg-white/5 p-6 rounded">
          <h3 className="font-mono text-sm font-bold text-white uppercase tracking-[0.2em] mb-4">
            System Info
          </h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="font-mono text-[11px] text-white/50 uppercase tracking-[0.15em]">
                Version
              </dt>
              <dd className="font-mono text-[11px] text-white">5.0</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-mono text-[11px] text-white/50 uppercase tracking-[0.15em]">
                Environment
              </dt>
              <dd className="font-mono text-[11px] text-white uppercase">
                {process.env.NODE_ENV || "production"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-mono text-[11px] text-white/50 uppercase tracking-[0.15em]">
                Role Hierarchy
              </dt>
              <dd className="font-mono text-[11px] text-white">
                Owner &gt; Admin &gt; Moderator
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-mono text-[11px] text-white/50 uppercase tracking-[0.11px]">
                Backend
              </dt>
              <dd className="font-mono text-[11px] text-white">Next.js API Routes</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-mono text-[11px] text-white/50 uppercase tracking-[0.15em]">
                Database
              </dt>
              <dd className="font-mono text-[11px] text-white">PostgreSQL</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
