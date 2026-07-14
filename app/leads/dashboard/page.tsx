import { getScoredLeads } from "@/app/lib/leadsData";
import { buildDashboardMetrics, countBy, countByServico, funilCounts, evolucaoMensal } from "@/app/lib/metrics";
import { CLASSIFICACAO_DOT_CLASSES } from "@/app/lib/leadStatus";
import CrmShell from "../CrmShell";
import { StatCard, BarList, MonthlyTrend } from "../ChartWidgets";

export const dynamic = "force-dynamic";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function LeadsDashboardPage() {
  const { leads } = await getScoredLeads();
  const m = buildDashboardMetrics(leads);

  const porServico = countByServico(leads).slice(0, 8);
  const porSegmento = countBy(leads, (l) => l.segmento);
  const porOrigem = countBy(leads, (l) => l.origem);
  const porEtapa = funilCounts(leads);
  const evolucao = evolucaoMensal(leads, 6);

  return (
    <CrmShell>
      <div className="mx-auto max-w-[1600px] px-6 py-6">
        <h1 className="mb-4 text-lg font-extrabold text-ink">Dashboard</h1>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total de leads" value={m.total.toString()} />
          <StatCard label="Leads frios" value={m.frios.toString()} accent="text-gray-500" />
          <StatCard label="Leads mornos" value={m.mornos.toString()} accent="text-amber-600" />
          <StatCard label="Leads quentes" value={m.quentes.toString()} accent="text-forest-700" />
          <StatCard label="Novos leads do mês" value={m.novosNoMes.toString()} />
          <StatCard label="Propostas enviadas" value={m.propostasEnviadas.toString()} />
          <StatCard label="Negociações" value={m.negociacoes.toString()} />
          <StatCard label="Contratos fechados" value={m.ganhos.toString()} accent="text-forest-700" />
          <StatCard label="Contratos perdidos" value={m.perdidos.toString()} accent="text-red-600" />
          <StatCard label="Taxa de conversão" value={`${m.taxaConversao.toFixed(0)}%`} />
          <StatCard label="Valor em negociação" value={currency.format(m.valorEmNegociacao)} />
          <StatCard label="Valor vendido" value={currency.format(m.valorVendido)} accent="text-forest-700" />
        </div>

        <div className="mt-4 flex items-center gap-4 rounded-xl border border-border bg-white px-5 py-3 text-sm shadow-sm">
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
          <BarList title="Leads por Origem" rows={porOrigem} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <MonthlyTrend title="Evolução Mensal" rows={evolucao} />
          <BarList title="Conversão do Funil" rows={porEtapa} />
        </div>
      </div>
    </CrmShell>
  );
}
