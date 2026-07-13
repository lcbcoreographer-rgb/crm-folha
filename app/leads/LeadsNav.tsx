"use client";
import { useRouter, usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LeadsNav() {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/leads/logout", { method: "POST" });
    router.push("/leads/login");
    router.refresh();
  }

  const tabs = [
    { href: "/leads", label: "Kanban" },
    { href: "/leads/dashboard", label: "Dashboard" },
  ];

  return (
    <div className="sticky top-0 z-20 border-b border-forest-900/10 bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="text-sm font-extrabold uppercase tracking-[0.14em] text-forest-900">
            Folha CRM
          </span>
          <nav className="flex items-center gap-1">
            {tabs.map((tab) => (
              <a
                key={tab.href}
                href={tab.href}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  pathname === tab.href
                    ? "bg-forest-900 text-white"
                    : "text-ink-soft hover:bg-forest-900/5"
                }`}
              >
                {tab.label}
              </a>
            ))}
          </nav>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-forest-900"
        >
          <LogOut size={15} /> Sair
        </button>
      </div>
    </div>
  );
}
