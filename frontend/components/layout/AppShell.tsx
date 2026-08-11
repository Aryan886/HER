"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DemoModeBanner } from "./DemoModeBanner";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/lib/auth/useAuth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return <div className="min-h-screen bg-bg" />;

  return (
    <div className="min-h-screen bg-bg">
      <DemoModeBanner />
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl animate-[fadeIn_220ms_ease-out]">{children}</div>
        </main>
      </div>
    </div>
  );
}
