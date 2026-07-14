"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import type { Usuario } from "@/app/lib/crmTypes";

export default function Topbar({
  usuarios,
  currentUser,
}: {
  usuarios: Usuario[];
  currentUser: Usuario | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [query, setQuery] = useState("");

  async function selectUser(id: string) {
    setSwitching(true);
    try {
      await fetch("/api/leads/current-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: id }),
      });
      setOpen(false);
      router.refresh();
    } finally {
      setSwitching(false);
    }
  }

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
    router.push(`/leads/list${params}`);
  }

  const initials = currentUser?.nome ? currentUser.nome.slice(0, 2).toUpperCase() : "??";

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-white px-6 py-3.5">
      <div className="relative w-full max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input
          type="search"
          placeholder="Pesquisar empresa, telefone ou e-mail..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
          className="w-full rounded-lg border border-border bg-paper py-2 pl-9 pr-3 text-sm text-ink outline-none transition-colors focus:border-forest-700 focus:bg-white"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notificações"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper-dim"
        >
          <Bell size={18} />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-paper-dim"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white">
              {initials}
            </span>
            <span className="text-sm font-semibold text-ink">
              {currentUser?.nome || "Selecionar usuário"}
            </span>
            <ChevronDown size={14} className="text-ink-soft" />
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-border bg-white p-1.5 shadow-lg">
                {usuarios.length === 0 && (
                  <p className="px-3 py-2 text-xs text-ink-soft">
                    Nenhum usuário cadastrado. Adicione em Configurações.
                  </p>
                )}
                {usuarios.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    disabled={switching}
                    onClick={() => selectUser(u.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-paper-dim ${
                      u.id === currentUser?.id ? "font-semibold text-forest-700" : "text-ink"
                    }`}
                  >
                    {u.nome}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
