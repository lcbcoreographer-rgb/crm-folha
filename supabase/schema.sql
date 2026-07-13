create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- dados do formulário público
  nome text not null,
  empresa text not null,
  cargo text,
  email text not null,
  telefone text not null,
  cidade text,
  estado text,
  segmento text,
  faturamento text,
  servicos text[] not null default '{}',
  necessidade text,
  urgencia text,
  possui_licenca text,
  qual_licenca text,
  como_conheceu text,
  origem text not null default 'Landing Page',
  funcionarios text,
  -- score automático (calculado uma vez, na entrada)
  score int not null default 0,
  classificacao text not null default 'frio'
    check (classificacao in ('frio', 'morno', 'quente')),
  -- funil comercial
  status text not null default 'novos_leads'
    check (status in (
      'novos_leads', 'primeiro_contato', 'em_diagnostico',
      'proposta_elaboracao', 'proposta_enviada', 'negociacao',
      'fechado_ganho', 'perdido'
    )),
  responsavel text,
  -- campos agregáveis (usados no dashboard)
  valor_previsto numeric,
  valor_proposta numeric,
  valor_fechado numeric,
  servico_contratado text,
  motivo_perda text,
  -- campos livres por etapa (não entram nos agregados do dashboard)
  detalhes jsonb not null default '{}'
);

create index if not exists leads_created_at_idx on leads (created_at desc);
create index if not exists leads_status_idx on leads (status);
create index if not exists leads_classificacao_idx on leads (classificacao);

create table if not exists lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  tipo text not null check (tipo in ('criado', 'mudanca_status', 'observacao')),
  de_status text,
  para_status text,
  nota text
);

create index if not exists lead_events_lead_id_idx on lead_events (lead_id, created_at);

alter table leads enable row level security;
alter table lead_events enable row level security;
-- Sem policies: só a service_role key (server-only, nunca exposta ao client) acessa estas tabelas.
