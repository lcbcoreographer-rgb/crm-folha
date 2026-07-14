"use client";
import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import type { CrmConfig, Usuario } from "@/app/lib/crmTypes";
import { SectionCard, PontosEditor, StringListEditor, type PontosRow } from "./editors";

const TABS = [
  { id: "servicos", label: "Serviços" },
  { id: "segmentos", label: "Segmentos" },
  { id: "faixas", label: "Faixas" },
  { id: "motivos", label: "Motivos de Perda" },
  { id: "score", label: "Regras de Score" },
  { id: "usuarios", label: "Usuários" },
] as const;

type TabId = (typeof TABS)[number]["id"];

async function saveConfig(patch: Partial<CrmConfig>): Promise<CrmConfig> {
  const res = await fetch("/api/leads/config", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = await res.json();
  return data.config as CrmConfig;
}

export default function ConfiguracoesPanel({
  initialConfig,
  initialUsuarios,
}: {
  initialConfig: CrmConfig;
  initialUsuarios: Usuario[];
}) {
  const [tab, setTab] = useState<TabId>("servicos");
  const [config, setConfig] = useState(initialConfig);
  const [usuarios, setUsuarios] = useState(initialUsuarios);
  const [novoUsuario, setNovoUsuario] = useState("");
  const [addingUsuario, setAddingUsuario] = useState(false);

  async function addUsuario() {
    const nome = novoUsuario.trim();
    if (!nome) return;
    setAddingUsuario(true);
    try {
      const res = await fetch("/api/leads/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });
      const data = await res.json();
      if (data.usuario) {
        setUsuarios((prev) => [...prev, data.usuario].sort((a, b) => a.nome.localeCompare(b.nome)));
        setNovoUsuario("");
      }
    } finally {
      setAddingUsuario(false);
    }
  }

  async function toggleUsuario(usuario: Usuario) {
    const res = await fetch(`/api/leads/usuarios/${usuario.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !usuario.ativo }),
    });
    const data = await res.json();
    if (data.usuario) {
      setUsuarios((prev) => prev.map((u) => (u.id === data.usuario.id ? data.usuario : u)));
    }
  }

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-6">
      <h1 className="mb-4 text-lg font-extrabold text-ink">Configurações</h1>

      <div className="mb-5 flex flex-wrap gap-1 rounded-xl border border-border bg-white p-1.5 shadow-sm">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              tab === t.id ? "bg-forest-700 text-white" : "text-ink-soft hover:bg-paper-dim"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "servicos" && (
        <SectionCard title="Serviços" description="Pontuação de score por serviço de interesse.">
          <PontosEditor
            rows={config.servicos.map((s): PontosRow => ({ label: s.nome, pontos: s.pontos }))}
            onSave={async (rows) => {
              const servicos = rows.map((r) => ({ nome: r.label, pontos: r.pontos }));
              const next = await saveConfig({ servicos });
              setConfig(next);
            }}
          />
        </SectionCard>
      )}

      {tab === "segmentos" && (
        <SectionCard title="Segmentos" description="Pontuação de score por segmento da empresa.">
          <PontosEditor
            rows={config.segmentos.map((s): PontosRow => ({ label: s.nome, pontos: s.pontos }))}
            onSave={async (rows) => {
              const segmentos = rows.map((r) => ({ nome: r.label, pontos: r.pontos }));
              const next = await saveConfig({ segmentos });
              setConfig(next);
            }}
          />
        </SectionCard>
      )}

      {tab === "faixas" && (
        <div className="space-y-4">
          <SectionCard title="Faixas de Funcionários" description="Pontuação de score por porte da empresa.">
            <PontosEditor
              rows={config.faixasFuncionarios}
              onSave={async (rows) => {
                const next = await saveConfig({ faixasFuncionarios: rows });
                setConfig(next);
              }}
            />
          </SectionCard>
          <SectionCard title="Faixas de Faturamento" description="Pontuação de score por faixa de faturamento.">
            <PontosEditor
              rows={config.faixasFaturamento}
              onSave={async (rows) => {
                const next = await saveConfig({ faixasFaturamento: rows });
                setConfig(next);
              }}
            />
          </SectionCard>
        </div>
      )}

      {tab === "motivos" && (
        <SectionCard title="Motivos de Perda" description="Opções exibidas ao mover um lead para Negócio Perdido.">
          <StringListEditor
            values={config.motivosPerda}
            onSave={async (motivosPerda) => {
              const next = await saveConfig({ motivosPerda });
              setConfig(next);
            }}
          />
        </SectionCard>
      )}

      {tab === "score" && (
        <SectionCard
          title="Regras de Classificação"
          description="Score total até o limite Frio = Frio; acima até o limite Morno = Morno; acima disso = Quente."
        >
          <ScoreThresholdsEditor
            frioMax={config.scoreThresholds.frioMax}
            mornoMax={config.scoreThresholds.mornoMax}
            onSave={async (scoreThresholds) => {
              const next = await saveConfig({ scoreThresholds });
              setConfig(next);
            }}
          />
        </SectionCard>
      )}

      {tab === "usuarios" && (
        <SectionCard title="Usuários" description="Pessoas que podem ser selecionadas como responsável pelos leads.">
          <div className="space-y-2">
            {usuarios.map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className={`text-sm ${u.ativo ? "text-ink" : "text-ink-soft line-through"}`}>{u.nome}</span>
                <button
                  type="button"
                  onClick={() => toggleUsuario(u)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    u.ativo ? "bg-forest-100 text-forest-700" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {u.ativo ? "Ativo" : "Inativo"}
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-2">
              <input
                value={novoUsuario}
                onChange={(e) => setNovoUsuario(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addUsuario()}
                placeholder="Nome do novo usuário"
                className="w-full rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-ink outline-none focus:border-forest-700"
              />
              <button
                type="button"
                onClick={addUsuario}
                disabled={addingUsuario || !novoUsuario.trim()}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-forest-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-forest-800 disabled:opacity-60"
              >
                {addingUsuario ? <Loader2 size={12} className="animate-spin" /> : <Plus size={13} />}
                Adicionar
              </button>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function ScoreThresholdsEditor({
  frioMax,
  mornoMax,
  onSave,
}: {
  frioMax: number;
  mornoMax: number;
  onSave: (thresholds: { frioMax: number; mornoMax: number }) => Promise<void>;
}) {
  const [frio, setFrio] = useState(frioMax);
  const [morno, setMorno] = useState(mornoMax);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({ frioMax: frio, mornoMax: morno });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-ink">Frio até (pontos)</span>
        <input
          type="number"
          value={frio}
          onChange={(e) => setFrio(Number(e.target.value))}
          className="w-32 rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-ink outline-none focus:border-forest-700"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-ink">Morno até (pontos) — acima disso é Quente</span>
        <input
          type="number"
          value={morno}
          onChange={(e) => setMorno(Number(e.target.value))}
          className="w-32 rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-ink outline-none focus:border-forest-700"
        />
      </label>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-1.5 rounded-full bg-forest-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-forest-800 disabled:opacity-60"
      >
        {saving && <Loader2 size={12} className="animate-spin" />}
        Salvar
      </button>
    </div>
  );
}
