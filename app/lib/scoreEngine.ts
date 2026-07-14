import type { Classificacao } from "./leadTypes";
import type { CrmConfig } from "./crmTypes";

interface ScorableLead {
  servicos: string[];
  segmento: string | null;
  funcionarios: string | null;
  faturamento: string | null;
}

export function computeScore(lead: ScorableLead, config: CrmConfig): number {
  let score = 0;

  for (const servico of lead.servicos) {
    const rule = config.servicos.find((s) => s.nome === servico);
    if (rule) score += rule.pontos;
  }

  if (lead.segmento) {
    const rule = config.segmentos.find((s) => s.nome === lead.segmento);
    if (rule) {
      score += rule.pontos;
    } else {
      const outros = config.segmentos.find((s) => s.nome === "Outros");
      if (outros) score += outros.pontos;
    }
  }

  if (lead.funcionarios) {
    const rule = config.faixasFuncionarios.find((f) => f.label === lead.funcionarios);
    if (rule) score += rule.pontos;
  }

  if (lead.faturamento) {
    const rule = config.faixasFaturamento.find((f) => f.label === lead.faturamento);
    if (rule) score += rule.pontos;
  }

  return score;
}

export function classify(score: number, config: CrmConfig): Classificacao {
  const { frioMax, mornoMax } = config.scoreThresholds;
  if (score <= frioMax) return "frio";
  if (score <= mornoMax) return "morno";
  return "quente";
}

export function applyScore<T extends ScorableLead>(
  lead: T,
  config: CrmConfig
): T & { score: number; classificacao: Classificacao } {
  const score = computeScore(lead, config);
  return { ...lead, score, classificacao: classify(score, config) };
}
