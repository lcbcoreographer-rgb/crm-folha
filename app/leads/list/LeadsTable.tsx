"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Lead } from "@/app/lib/leadTypes";
import {
  STATUS_LABELS,
  CLASSIFICACAO_LABELS,
  CLASSIFICACAO_BADGE_CLASSES,
} from "@/app/lib/leadStatus";
import FilterBar, { EMPTY_FILTERS, type LeadFilters } from "../FilterBar";
import LeadDrawer from "../LeadDrawer";

const PAGE_SIZE = 20;

export default function LeadsTable({
  initialLeads,
  initialQuery,
}: {
  initialLeads: Lead[];
  initialQuery: string;
}) {
  const [leads, setLeads] = useState(initialLeads);
  const [filters, setFilters] = useState<LeadFilters>(EMPTY_FILTERS);
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filteredLeads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((lead) => {
      if (filters.servico && !lead.servicos.includes(filters.servico)) return false;
      if (filters.segmento && lead.segmento !== filters.segmento) return false;
      if (filters.cidade && lead.cidade !== filters.cidade) return false;
      if (filters.estado && lead.estado !== filters.estado) return false;
      if (filters.responsavel && lead.responsavel !== filters.responsavel) return false;
      if (filters.classificacao && lead.classificacao !== filters.classificacao) return false;
      if (filters.dataInicio && lead.created_at < filters.dataInicio) return false;
      if (filters.dataFim && lead.created_at > `${filters.dataFim}T23:59:59`) return false;
      if (q) {
        const haystack = `${lead.nome} ${lead.empresa} ${lead.telefone} ${lead.email}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [leads, filters, query]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageLeads = filteredLeads.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleFiltersChange(next: LeadFilters) {
    setFilters(next);
    setPage(1);
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-white px-6 py-4">
        <h1 className="text-lg font-extrabold text-ink">Leads</h1>
        <div className="relative w-full max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            placeholder="Buscar por empresa, telefone ou e-mail..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-border bg-paper py-1.5 pl-8 pr-3 text-sm text-ink outline-none transition-colors focus:border-forest-700 focus:bg-white"
          />
        </div>
      </div>

      <FilterBar leads={leads} filters={filters} onChange={handleFiltersChange} />

      <div className="overflow-x-auto px-6 py-4">
        <table className="w-full min-w-[1100px] border-separate border-spacing-0 overflow-hidden rounded-xl border border-border bg-white text-sm shadow-sm">
          <thead>
            <tr className="bg-paper-dim text-left text-xs font-bold uppercase tracking-wide text-ink-soft">
              {[
                "Nome",
                "Empresa",
                "Telefone",
                "Cidade",
                "Estado",
                "Serviço",
                "Segmento",
                "Responsável",
                "Origem",
                "Score",
                "Classificação",
                "Status",
                "Data",
              ].map((col) => (
                <th key={col} className="whitespace-nowrap border-b border-border px-3 py-2.5">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageLeads.length === 0 && (
              <tr>
                <td colSpan={13} className="px-3 py-8 text-center text-ink-soft">
                  Nenhum lead encontrado.
                </td>
              </tr>
            )}
            {pageLeads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className="cursor-pointer border-b border-border last:border-0 hover:bg-paper-dim/60"
              >
                <td className="whitespace-nowrap px-3 py-2.5 font-medium text-ink">{lead.nome}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-ink">{lead.empresa}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">{lead.telefone}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">{lead.cidade || "-"}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">{lead.estado || "-"}</td>
                <td className="max-w-[160px] truncate px-3 py-2.5 text-ink-soft">{lead.servicos.join(", ") || "-"}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">{lead.segmento || "-"}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">{lead.responsavel || "-"}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">{lead.origem}</td>
                <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-ink">{lead.score}</td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${CLASSIFICACAO_BADGE_CLASSES[lead.classificacao]}`}
                  >
                    {CLASSIFICACAO_LABELS[lead.classificacao]}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">{STATUS_LABELS[lead.status]}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">
                  {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 flex items-center justify-between text-sm text-ink-soft">
          <span>
            {filteredLeads.length} lead{filteredLeads.length === 1 ? "" : "s"} · página {currentPage} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-border bg-white px-3 py-1.5 font-semibold text-ink disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-border bg-white px-3 py-1.5 font-semibold text-ink disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>

      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={(updated) => {
            setLeads((prev) => prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
            setSelectedLead(updated);
          }}
        />
      )}
    </div>
  );
}
