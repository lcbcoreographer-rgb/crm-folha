import { getSupabaseAdmin } from "@/app/lib/supabase";
import type { Lead, LeadStatus } from "@/app/lib/leadTypes";
import { STATUS_ORDER, STATUS_LABELS, CLASSIFICACAO_DOT_CLASSES } from "@/app/lib/leadStatus";
import LeadsNav from "../LeadsNav";

export const dynamic = "force-dynamic";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function StatTile({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-forest-900/10 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
      <p className={`mt-1.5 text-2xl font-extrabold ${accent || "text-forest-900"}`}>{value}</p>
    </div>
  );
}

function BarList({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: number }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="rounded-xl border border-forest-900/10 bg-white p-5">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-ink-soft">{title}</h3>
      <div className="space-y-3">
        {rows.length === 0 && <p className="text-sm text-ink-soft">Sem dados ainda.</p>}
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-ink">{row.label}</span>
              <span className="font-semibold text-forest-900">{row.value}</span>
            </div>
            <div className="h-2 rounded-full bg-paper-dim">
              <div
                className="h-2 rounded-full bg-forest-700"
                style={{ width: `${(row.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function LeadsDashboardPage() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("leads").select("*");
  if (error) console.error("[leads/dashboard] falha ao carregar leads:", error);
  const leads = (data as Lead[]) || [];

  const total = leads.length;
  const frios = leads.filter((l) => l.classificacao === "frio").length;
  const mornos = leads.filter((l) => l.classificacao === "morno").length;
  const quentes = leads.filter((l) => l.classificacao === "quente").length;

  const ganhos = leads.filter((l) => l.status === "fechado_ganho").length;
  const perdidos = leads.filter((l) => l.status === "perdido").length;
  const taxaConversao = ganhos + perdidos > 0 ? (ganhos / (ganhos + perdidos)) * 100 : 0;

  const valorEmNegociacao = leads
    .filter((l) => ["proposta_elaboracao", "proposta_enviada", "negociacao"].includes(l.status))
    .reduce((sum, l) => sum + (l.valor_proposta ?? l.valor_previsto ?? 0), 0);

  const valorFechado = leads
    .filter((l) => l.status === "fechado_ganho")
    .reduce((sum, l) => sum + (l.valor_fechado ?? 0), 0);

  const servicoCounts = new Map<string, number>();
  for (const lead of leads) {
    for (const servico of lead.servicos) {
      servicoCounts.set(servico, (servicoCounts.get(servico) || 0) + 1);
    }
  }
  const porServico = Array.from(servicoCounts, ([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const segmentoCounts = new Map<string, number>();
  for (const lead of leads) {
    if (!lead.segmento) continue;
    segmentoCounts.set(lead.segmento, (segmentoCounts.get(lead.segmento) || 0) + 1);
  }
  const porSegmento = Array.from(segmentoCounts, ([label, value]) => ({ label, value })).sort(
    (a, b) => b.value - a.value
  );

  const porEtapa = STATUS_ORDER.map((status: LeadStatus) => ({
    label: STATUS_LABELS[status],
    value: leads.filter((l) => l.status === status).length,
  }));

  return (
    <>
      <LeadsNav />
      <div className="mx-auto max-w-[1600px] px-6 py-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatTile label="Total de leads" value={total.toString()} />
          <StatTile label="Frios" value={frios.toString()} accent="text-gray-500" />
          <StatTile label="Mornos" value={mornos.toString()} accent="text-amber-600" />
          <StatTile label="Quentes" value={quentes.toString()} accent="text-red-600" />
          <StatTile label="Ganhos" value={ganhos.toString()} accent="text-forest-700" />
          <StatTile label="Perdidos" value={perdidos.toString()} accent="text-red-600" />
          <StatTile label="Taxa de conversão" value={`${taxaConversao.toFixed(0)}%`} />
          <StatTile label="Valor em negociação" value={currency.format(valorEmNegociacao)} />
          <StatTile label="Valor fechado" value={currency.format(valorFechado)} accent="text-forest-700" />
        </div>

        <div className="mt-4 flex items-center gap-4 rounded-xl border border-forest-900/10 bg-white px-5 py-3 text-sm">
          {(["frio", "morno", "quente"] as const).map((c) => (
            <span key={c} className="flex items-center gap-1.5 text-ink-soft">
              <span className={`h-2 w-2 rounded-full ${CLASSIFICACAO_DOT_CLASSES[c]}`} />
              {c === "frio" ? "Frio" : c === "morno" ? "Morno" : "Quente"}
            </span>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <BarList title="Leads por Serviço" rows={porServico} />
          <BarList title="Leads por Segmento" rows={porSegmento} />
          <BarList title="Funil Comercial" rows={porEtapa} />
        </div>
      </div>
    </>
  );
}
