import type { Lead, LeadStatus } from "./leadTypes";
import { STATUS_ORDER, STATUS_LABELS } from "./leadStatus";

export interface CountRow {
  label: string;
  value: number;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function countBy(leads: Lead[], pick: (lead: Lead) => string | null | undefined): CountRow[] {
  const counts = new Map<string, number>();
  for (const lead of leads) {
    const key = pick(lead);
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Array.from(counts, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

export function countByServico(leads: Lead[]): CountRow[] {
  const counts = new Map<string, number>();
  for (const lead of leads) {
    for (const servico of lead.servicos) {
      counts.set(servico, (counts.get(servico) || 0) + 1);
    }
  }
  return Array.from(counts, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

export function funilCounts(leads: Lead[]): CountRow[] {
  return STATUS_ORDER.map((status: LeadStatus) => ({
    label: STATUS_LABELS[status],
    value: leads.filter((l) => l.status === status).length,
  }));
}

export function evolucaoMensal(leads: Lead[], meses = 6): CountRow[] {
  const now = new Date();
  const buckets: { key: string; label: string }[] = [];
  for (let i = meses - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
    });
  }
  const counts = new Map(buckets.map((b) => [b.key, 0]));
  for (const lead of leads) {
    const d = new Date(lead.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (counts.has(key)) counts.set(key, (counts.get(key) || 0) + 1);
  }
  return buckets.map((b) => ({ label: b.label, value: counts.get(b.key) || 0 }));
}

export interface DashboardMetrics {
  total: number;
  frios: number;
  mornos: number;
  quentes: number;
  novosNoMes: number;
  propostasEnviadas: number;
  negociacoes: number;
  ganhos: number;
  perdidos: number;
  taxaConversao: number;
  valorEmNegociacao: number;
  valorVendido: number;
  valorPerdido: number;
}

export function buildDashboardMetrics(leads: Lead[]): DashboardMetrics {
  const total = leads.length;
  const frios = leads.filter((l) => l.classificacao === "frio").length;
  const mornos = leads.filter((l) => l.classificacao === "morno").length;
  const quentes = leads.filter((l) => l.classificacao === "quente").length;

  const inicioMes = startOfMonth(new Date());
  const novosNoMes = leads.filter((l) => new Date(l.created_at) >= inicioMes).length;

  const propostasEnviadas = leads.filter((l) => l.status === "proposta_enviada").length;
  const negociacoes = leads.filter((l) => l.status === "negociacao").length;
  const ganhos = leads.filter((l) => l.status === "fechado_ganho").length;
  const perdidos = leads.filter((l) => l.status === "perdido").length;
  const taxaConversao = ganhos + perdidos > 0 ? (ganhos / (ganhos + perdidos)) * 100 : 0;

  const valorEmNegociacao = leads
    .filter((l) => ["proposta_elaboracao", "proposta_enviada", "negociacao"].includes(l.status))
    .reduce((sum, l) => sum + (l.valor_proposta ?? l.valor_previsto ?? 0), 0);

  const valorVendido = leads
    .filter((l) => l.status === "fechado_ganho")
    .reduce((sum, l) => sum + (l.valor_fechado ?? 0), 0);

  const valorPerdido = leads
    .filter((l) => l.status === "perdido")
    .reduce((sum, l) => sum + (l.valor_proposta ?? l.valor_previsto ?? 0), 0);

  return {
    total,
    frios,
    mornos,
    quentes,
    novosNoMes,
    propostasEnviadas,
    negociacoes,
    ganhos,
    perdidos,
    taxaConversao,
    valorEmNegociacao,
    valorVendido,
    valorPerdido,
  };
}
