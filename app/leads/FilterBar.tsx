"use client";
import type { Lead } from "@/app/lib/leadTypes";
import { CLASSIFICACAO_LABELS } from "@/app/lib/leadStatus";

export interface LeadFilters {
  servico: string;
  segmento: string;
  cidade: string;
  estado: string;
  responsavel: string;
  classificacao: string;
  dataInicio: string;
  dataFim: string;
}

export const EMPTY_FILTERS: LeadFilters = {
  servico: "",
  segmento: "",
  cidade: "",
  estado: "",
  responsavel: "",
  classificacao: "",
  dataInicio: "",
  dataFim: "",
};

function uniqueValues(values: (string | null)[]) {
  return Array.from(new Set(values.filter((v): v is string => !!v))).sort();
}

const selectClass =
  "rounded-lg border border-forest-900/15 bg-white px-2.5 py-1.5 text-xs text-ink outline-none transition-colors focus:border-forest-700";

export default function FilterBar({
  leads,
  filters,
  onChange,
}: {
  leads: Lead[];
  filters: LeadFilters;
  onChange: (filters: LeadFilters) => void;
}) {
  const servicos = uniqueValues(leads.flatMap((l) => l.servicos));
  const segmentos = uniqueValues(leads.map((l) => l.segmento));
  const cidades = uniqueValues(leads.map((l) => l.cidade));
  const estados = uniqueValues(leads.map((l) => l.estado));
  const responsaveis = uniqueValues(leads.map((l) => l.responsavel));

  function set<K extends keyof LeadFilters>(key: K, value: string) {
    onChange({ ...filters, [key]: value });
  }

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-forest-900/10 bg-paper px-6 py-3">
      <select
        className={selectClass}
        value={filters.servico}
        onChange={(e) => set("servico", e.target.value)}
      >
        <option value="">Serviço</option>
        {servicos.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select
        className={selectClass}
        value={filters.segmento}
        onChange={(e) => set("segmento", e.target.value)}
      >
        <option value="">Segmento</option>
        {segmentos.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select
        className={selectClass}
        value={filters.cidade}
        onChange={(e) => set("cidade", e.target.value)}
      >
        <option value="">Cidade</option>
        {cidades.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select
        className={selectClass}
        value={filters.estado}
        onChange={(e) => set("estado", e.target.value)}
      >
        <option value="">Estado</option>
        {estados.map((e) => (
          <option key={e} value={e}>{e}</option>
        ))}
      </select>
      <select
        className={selectClass}
        value={filters.responsavel}
        onChange={(e) => set("responsavel", e.target.value)}
      >
        <option value="">Responsável</option>
        {responsaveis.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <select
        className={selectClass}
        value={filters.classificacao}
        onChange={(e) => set("classificacao", e.target.value)}
      >
        <option value="">Classificação</option>
        {Object.entries(CLASSIFICACAO_LABELS).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <input
        type="date"
        className={selectClass}
        value={filters.dataInicio}
        onChange={(e) => set("dataInicio", e.target.value)}
      />
      <span className="text-xs text-ink-soft">até</span>
      <input
        type="date"
        className={selectClass}
        value={filters.dataFim}
        onChange={(e) => set("dataFim", e.target.value)}
      />
      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="ml-1 text-xs font-semibold text-amber-600 hover:text-amber-700"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
