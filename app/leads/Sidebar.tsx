"use client";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Building2,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

const NAV = [
  { href: "/leads/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads/list", label: "Leads", icon: Users },
  { href: "/leads", label: "Kanban Comercial", icon: KanbanSquare },
  { href: "/leads/clientes", label: "Clientes", icon: Building2 },
  { href: "/leads/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/leads/configuracoes", label: "Configurações", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/leads/logout", { method: "POST" });
    router.push("/leads/login");
    router.refresh();
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-white">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Image src="/logo.png" alt="Folha Soluções Ambientais" width={36} height={36} className="shrink-0 rounded-lg" />
        <div>
          <p className="text-sm font-extrabold leading-tight text-ink">Folha CRM</p>
          <p className="text-[11px] leading-tight text-ink-soft">Soluções Ambientais</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active =
            item.href === "/leads"
              ? pathname === "/leads"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-forest-50 text-forest-700"
                  : "text-ink-soft hover:bg-paper-dim hover:text-ink"
              }`}
            >
              <Icon size={17} />
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-paper-dim hover:text-ink"
        >
          <LogOut size={17} /> Sair
        </button>
      </div>
    </aside>
  );
}
