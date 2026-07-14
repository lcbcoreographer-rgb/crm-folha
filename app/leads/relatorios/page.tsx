import { getScoredLeads } from "@/app/lib/leadsData";
import { getSupabaseAdmin } from "@/app/lib/supabase";
import { buildDashboardMetrics, countBy, countByServico } from "@/app/lib/metrics";
import CrmShell from "../CrmShell";
import { StatCard, BarList } from "../ChartWidgets";

export const dynamic = "force-dynamic";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

async function getTempoMedioFechamentoDias(leadIds: string[]): Promise<number | null> {
  if (leadIds.length === 0) return null;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("lead_events")
    .select("lead_id, created_at")
    .eq("tipo", "mudanca_status")
    .eq("para_status", "fechado_ganho")
    .in("lead_id", leadIds);

  if (error || !data || data.length === 0) return null;

  const { data: leadsData } = await supabase
    .from("leads")
    .select("id, created_at")
    .in("id", leadIds);

  const createdMap = new Map((leadsData || []).map((l) => [l.id as string, l.created_at as string]));
  const diffs: number[] = [];
  for (const event of data) {
    const createdAt = createdMap.get(event.lead_id as string);
    if (!createdAt) continue;
    const dias = (new Date(event.created_at as string).getTime() - new Date(createdAt).getTime()) / 86_400_000;
    if (dias >= 0) diffs.push(dias);
  }
  if (diffs.length === 0) return null;
  return diffs.reduce((a, b) => a + b, 0) / diffs.length;
}

export default async function RelatoriosPage() {
  const { leads } = await getScoredLeads();
  const m = buildDashboardMetrics(leads);

  const ganhos = leads.filter((l) => l.status === "fechado_ganho");
  const tempoMedioDias = await getTempoMedioFechamentoDias(ganhos.map((l) => l.id));

  const porServico = countByServico(leads);
  const porSegmento = countBy(leads, (l) => l.segmento);
  const porCidade = countBy(leads, (l) => l.cidade);
  const porOrigem = countBy(leads, (l) => l.origem);
  const motivosPerda = countBy(
    leads.filter((l) => l.status === "perdido"),
    (l) => l.motivo_perda
  );

  return (
    <CrmShell>
      <div className="mx-auto max-w-[1600px] px-6 py-6">
        <h1 className="mb-4 text-lg font-extrabold text-ink">Relatórios</h1>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Quantidade de leads" value={m.total.toString()} />
          <StatCard label="Conversão" value={`${m.taxaConversao.toFixed(0)}%`} />
          <StatCard label="Valor vendido" value={currency.format(m.valorVendido)} accent="text-forest-700" />
          <StatCard label="Valor perdido" value={currency.format(m.valorPerdido)} accent="text-red-600" />
          <StatCard label="Valor em negociação" value={currency.format(m.valorEmNegociacao)} />
          <StatCard
            label="Tempo médio até fechamento"
            value={tempoMedioDias === null ? "-" : `${tempoMedioDias.toFixed(0)} dias`}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <BarList title="Leads por Serviço" rows={porServico} />
          <BarList title="Leads por Segmento" rows={porSegmento} />
          <BarList title="Leads por Cidade" rows={porCidade} />
          <BarList title="Leads por Origem" rows={porOrigem} />
          <BarList title="Motivos de Perda" rows={motivosPerda} />
        </div>
      </div>
    </CrmShell>
  );
}
