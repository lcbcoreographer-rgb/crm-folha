export interface ScoreItemRule {
  nome: string;
  pontos: number;
}

export interface FaixaRule {
  label: string;
  pontos: number;
}

export interface ScoreThresholds {
  frioMax: number;
  mornoMax: number;
}

export interface CrmConfig {
  servicos: ScoreItemRule[];
  segmentos: ScoreItemRule[];
  faixasFuncionarios: FaixaRule[];
  faixasFaturamento: FaixaRule[];
  motivosPerda: string[];
  scoreThresholds: ScoreThresholds;
}

export interface Usuario {
  id: string;
  created_at: string;
  nome: string;
  avatar_url: string | null;
  ativo: boolean;
}

export type ClienteStatus = "ativo" | "pausado" | "encerrado";

export interface Cliente {
  id: string;
  created_at: string;
  lead_id: string | null;
  empresa: string;
  contato: string | null;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  servico_contratado: string | null;
  valor: number | null;
  data_inicio: string;
  responsavel: string | null;
  status: ClienteStatus;
  observacoes: string | null;
}

export interface LeadFile {
  id: string;
  created_at: string;
  lead_id: string;
  path: string;
  filename: string;
  size: number | null;
  uploaded_by: string | null;
}
