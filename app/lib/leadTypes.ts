export interface LeadData {
  nome: string;
  empresa: string;
  cargo: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  segmento: string;
  faturamento: string;
  servicos: string[];
  necessidade: string;
  urgencia: string;
  possuiLicenca: "" | "sim" | "nao" | "nao-sei";
  qualLicenca: string;
  comoConheceu: string;
}

export type Classificacao = "frio" | "morno" | "quente";

export type LeadStatus =
  | "novos_leads"
  | "primeiro_contato"
  | "em_diagnostico"
  | "proposta_elaboracao"
  | "proposta_enviada"
  | "negociacao"
  | "fechado_ganho"
  | "perdido";

export interface LeadDetalhes {
  documentacaoNecessaria?: string;
  problemasDiagnostico?: string;
  prazoRetorno?: string;
  contrapropostas?: string;
  duvidasPendencias?: string;
}

export interface Lead {
  id: string;
  created_at: string;
  nome: string;
  empresa: string;
  cargo: string | null;
  email: string;
  telefone: string;
  cidade: string | null;
  estado: string | null;
  segmento: string | null;
  faturamento: string | null;
  servicos: string[];
  necessidade: string | null;
  urgencia: string | null;
  possui_licenca: string | null;
  qual_licenca: string | null;
  como_conheceu: string | null;
  origem: string;
  funcionarios: string | null;
  score: number;
  classificacao: Classificacao;
  status: LeadStatus;
  responsavel: string | null;
  valor_previsto: number | null;
  valor_proposta: number | null;
  valor_fechado: number | null;
  servico_contratado: string | null;
  motivo_perda: string | null;
  detalhes: LeadDetalhes;
}

export interface LeadEvent {
  id: string;
  lead_id: string;
  created_at: string;
  tipo: "criado" | "mudanca_status" | "observacao";
  de_status: string | null;
  para_status: string | null;
  nota: string | null;
}
