"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, ClipboardList, FileText, HeartPulse, LogOut, Stethoscope } from "lucide-react";
import { useAuth } from "@/lib/auth/useAuth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/symptoms", label: "Symptoms", icon: HeartPulse },
  { href: "/visits", label: "Visits", icon: Stethoscope },
  { href: "/summary", label: "Summary", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <aside className="flex min-h-[calc(100vh-41px)] w-full flex-col border-r border-border bg-rose-light/70 p-4 lg:w-60">
      <Link href="/dashboard" className="mb-8 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-card bg-rose text-white">
          <ClipboardList className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="hidden lg:block">
          <span className="block font-display text-2xl leading-none">HER</span>
          <span className="text-caption text-muted">Heard, Evidenced, Recorded</span>
        </span>
      </Link>

      <nav className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-11 items-center gap-3 rounded-btn border-l-[3px] px-3 py-3 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2 ${
                active
                  ? "border-l-rose bg-white text-rose shadow-card"
                  : "border-l-transparent text-muted hover:bg-white/70 hover:text-graphite"
              }`}
              title={item.label}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden border-t border-rose-muted pt-4 lg:block">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-white text-sm font-semibold text-rose shadow-card">
            {user?.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-caption text-muted">{user?.email}</p>
          </div>
        </div>
        <button
          className="btn-ghost w-full justify-start"
          onClick={() => {
            logout();
            router.push("/login");
          }}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </button>
      </div>
    </aside>
  );
}
