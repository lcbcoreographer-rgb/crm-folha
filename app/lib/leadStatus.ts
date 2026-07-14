import type { Classificacao, LeadStatus } from "./leadTypes";

export const STATUS_ORDER: LeadStatus[] = [
  "novos_leads",
  "primeiro_contato",
  "em_diagnostico",
  "proposta_elaboracao",
  "proposta_enviada",
  "negociacao",
  "fechado_ganho",
  "perdido",
];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  novos_leads: "Novos Leads",
  primeiro_contato: "Primeiro Contato",
  em_diagnostico: "Em Diagnóstico",
  proposta_elaboracao: "Proposta em Elaboração",
  proposta_enviada: "Proposta Enviada",
  negociacao: "Negociação",
  fechado_ganho: "Fechado (Ganho)",
  perdido: "Perdido",
};

export const CLASSIFICACAO_LABELS: Record<Classificacao, string> = {
  frio: "Frio",
  morno: "Morno",
  quente: "Quente",
};

export const CLASSIFICACAO_BADGE_CLASSES: Record<Classificacao, string> = {
  frio: "bg-gray-200 text-gray-600",
  morno: "bg-amber-100 text-amber-700",
  quente: "bg-red-100 text-red-700",
};

export const CLASSIFICACAO_DOT_CLASSES: Record<Classificacao, string> = {
  frio: "bg-gray-400",
  morno: "bg-amber-500",
  quente: "bg-red-500",
};
