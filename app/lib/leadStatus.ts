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
  frio: "bg-blue-100 text-blue-700",
  morno: "bg-yellow-100 text-yellow-700",
  quente: "bg-red-100 text-red-700",
};

export const CLASSIFICACAO_DOT_CLASSES: Record<Classificacao, string> = {
  frio: "bg-blue-500",
  morno: "bg-yellow-500",
  quente: "bg-red-500",
};

export const CLASSIFICACAO_CARD_CLASSES: Record<Classificacao, string> = {
  frio: "bg-blue-200/40 border-blue-400/60",
  morno: "bg-yellow-200/40 border-yellow-400/60",
  quente: "bg-red-200/40 border-red-400/60",
};
