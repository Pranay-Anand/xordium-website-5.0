"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/admin-api";

export default function AdminRoot() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/admin/dashboard");
    } else {
      router.push("/admin/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="font-mono text-xs text-white/60 uppercase tracking-[0.2em]">
        Redirecting...
      </p>
    </div>
  );
}
