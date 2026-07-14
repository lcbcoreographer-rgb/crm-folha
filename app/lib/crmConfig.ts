import "server-only";
import { getSupabaseAdmin } from "./supabase";
import type { CrmConfig } from "./crmTypes";

export const DEFAULT_CRM_CONFIG: CrmConfig = {
  servicos: [
    { nome: "Licenciamento Ambiental", pontos: 30 },
    { nome: "PRAD", pontos: 30 },
    { nome: "Outorga", pontos: 25 },
    { nome: "Consultoria Ambiental", pontos: 20 },
    { nome: "PGRS", pontos: 20 },
    { nome: "CAR", pontos: 15 },
  ],
  segmentos: [
    { nome: "Postos de Combustíveis", pontos: 20 },
    { nome: "Portuário", pontos: 20 },
    { nome: "Transporte / Logística", pontos: 15 },
    { nome: "Indústria", pontos: 15 },
    { nome: "Agronegócio", pontos: 15 },
    { nome: "Outros", pontos: 10 },
  ],
  faixasFuncionarios: [
    { label: "1 até 10", pontos: 5 },
    { label: "11 até 50", pontos: 10 },
    { label: "51 até 100", pontos: 15 },
    { label: "Acima de 100", pontos: 20 },
  ],
  faixasFaturamento: [
    { label: "Até R$100 mil", pontos: 5 },
    { label: "R$100 mil até R$500 mil", pontos: 10 },
    { label: "R$500 mil até R$1 milhão", pontos: 15 },
    { label: "Acima de R$1 milhão", pontos: 20 },
  ],
  motivosPerda: ["Preço", "Concorrência", "Sem retorno", "Projeto cancelado", "Cliente desistiu", "Outro"],
  scoreThresholds: { frioMax: 39, mornoMax: 69 },
};

export async function getCrmConfig(): Promise<CrmConfig> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("crm_config").select("data").eq("id", 1).single();
  if (error || !data) return DEFAULT_CRM_CONFIG;
  return { ...DEFAULT_CRM_CONFIG, ...(data.data as Partial<CrmConfig>) };
}

export async function updateCrmConfig(patch: Partial<CrmConfig>): Promise<CrmConfig> {
  const current = await getCrmConfig();
  const next: CrmConfig = { ...current, ...patch };
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("crm_config").upsert({ id: 1, data: next });
  if (error) throw error;
  return next;
}
