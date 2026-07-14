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

-- ============================================================
-- CRM completo: config, usuários, clientes, arquivos
-- ============================================================

alter table lead_events add column if not exists usuario text;

create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nome text not null,
  avatar_url text,
  ativo boolean not null default true
);

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid references leads(id) on delete set null,
  empresa text not null,
  contato text,
  telefone text,
  whatsapp text,
  email text,
  servico_contratado text,
  valor numeric,
  data_inicio date not null default current_date,
  responsavel text,
  status text not null default 'ativo'
    check (status in ('ativo', 'pausado', 'encerrado')),
  observacoes text
);

create index if not exists clientes_lead_id_idx on clientes (lead_id);

create table if not exists lead_files (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid not null references leads(id) on delete cascade,
  path text not null,
  filename text not null,
  size bigint,
  uploaded_by text
);

create index if not exists lead_files_lead_id_idx on lead_files (lead_id);

-- Config única do CRM (regras de score, listas editáveis) — singleton row.
create table if not exists crm_config (
  id smallint primary key default 1 check (id = 1),
  data jsonb not null default '{}'
);

insert into crm_config (id, data)
values (1, '{
  "servicos": [
    {"nome": "Licenciamento Ambiental", "pontos": 30},
    {"nome": "PRAD", "pontos": 30},
    {"nome": "Outorga", "pontos": 25},
    {"nome": "Consultoria Ambiental", "pontos": 20},
    {"nome": "PGRS", "pontos": 20},
    {"nome": "CAR", "pontos": 15}
  ],
  "segmentos": [
    {"nome": "Postos de Combustíveis", "pontos": 20},
    {"nome": "Portuário", "pontos": 20},
    {"nome": "Transporte / Logística", "pontos": 15},
    {"nome": "Indústria", "pontos": 15},
    {"nome": "Agronegócio", "pontos": 15},
    {"nome": "Outros", "pontos": 10}
  ],
  "faixasFuncionarios": [
    {"label": "1 até 10", "pontos": 5},
    {"label": "11 até 50", "pontos": 10},
    {"label": "51 até 100", "pontos": 15},
    {"label": "Acima de 100", "pontos": 20}
  ],
  "faixasFaturamento": [
    {"label": "Até R$100 mil", "pontos": 5},
    {"label": "R$100 mil até R$500 mil", "pontos": 10},
    {"label": "R$500 mil até R$1 milhão", "pontos": 15},
    {"label": "Acima de R$1 milhão", "pontos": 20}
  ],
  "motivosPerda": ["Preço", "Concorrência", "Sem retorno", "Projeto cancelado", "Cliente desistiu", "Outro"],
  "scoreThresholds": {"frioMax": 39, "mornoMax": 69}
}'::jsonb)
on conflict (id) do nothing;

alter table usuarios enable row level security;
alter table clientes enable row level security;
alter table lead_files enable row level security;
alter table crm_config enable row level security;
-- Sem policies: só a service_role key (server-only) acessa estas tabelas.

-- Bucket de storage para anexos do lead (privado; só service_role acessa).
insert into storage.buckets (id, name, public)
values ('lead-files', 'lead-files', false)
on conflict (id) do nothing;
