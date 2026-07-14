"use client";
import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import type { Lead, LeadEvent } from "@/app/lib/leadTypes";
import type { Usuario } from "@/app/lib/crmTypes";
import { STATUS_LABELS, CLASSIFICACAO_LABELS, CLASSIFICACAO_BADGE_CLASSES } from "@/app/lib/leadStatus";
import LeadFiles from "./LeadFiles";

const fieldClass =
  "w-full rounded-lg border border-forest-900/15 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-forest-700";

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-3 py-1 text-sm">
      <span className="text-ink-soft">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  );
}

function eventDescription(event: LeadEvent) {
  if (event.tipo === "criado") return "Lead criado";
  if (event.tipo === "mudanca_status") {
    const de = event.de_status ? STATUS_LABELS[event.de_status as keyof typeof STATUS_LABELS] : "-";
    const para = event.para_status ? STATUS_LABELS[event.para_status as keyof typeof STATUS_LABELS] : "-";
    return `Movido de "${de}" para "${para}"`;
  }
  return event.nota || "Observação";
}

export default function LeadDrawer({
  lead,
  onClose,
  onUpdate,
}: {
  lead: Lead;
  onClose: () => void;
  onUpdate: (lead: Lead) => void;
}) {
  const [events, setEvents] = useState<LeadEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nota, setNota] = useState("");
  const [savingNota, setSavingNota] = useState(false);

  const [responsavel, setResponsavel] = useState(lead.responsavel || "");
  const [valorPrevisto, setValorPrevisto] = useState(lead.valor_previsto?.toString() || "");
  const [valorProposta, setValorProposta] = useState(lead.valor_proposta?.toString() || "");
  const [prazoRetorno, setPrazoRetorno] = useState(lead.detalhes?.prazoRetorno || "");
  const [problemasDiagnostico, setProblemasDiagnostico] = useState(lead.detalhes?.problemasDiagnostico || "");
  const [documentacaoNecessaria, setDocumentacaoNecessaria] = useState(lead.detalhes?.documentacaoNecessaria || "");
  const [contrapropostas, setContrapropostas] = useState(lead.detalhes?.contrapropostas || "");
  const [duvidasPendencias, setDuvidasPendencias] = useState(lead.detalhes?.duvidasPendencias || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/leads/${lead.id}/events`)
      .then((res) => res.json())
      .then((data) => setEvents(data.events || []))
      .finally(() => setLoadingEvents(false));
  }, [lead.id]);

  useEffect(() => {
    fetch("/api/leads/usuarios")
      .then((res) => res.json())
      .then((data) => setUsuarios((data.usuarios || []).filter((u: Usuario) => u.ativo)));
  }, []);

  async function handleAddNota() {
    if (!nota.trim()) return;
    setSavingNota(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nota }),
      });
      const data = await res.json();
      if (data.event) {
        setEvents((prev) => [...prev, data.event]);
        setNota("");
      }
    } finally {
      setSavingNota(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responsavel,
          valor_previsto: valorPrevisto ? Number(valorPrevisto) : null,
          valor_proposta: valorProposta ? Number(valorProposta) : null,
          detalhes: {
            ...lead.detalhes,
            prazoRetorno,
            problemasDiagnostico,
            documentacaoNecessaria,
            contrapropostas,
            duvidasPendencias,
          },
        }),
      });
      const data = await res.json();
      if (data.lead) onUpdate(data.lead as Lead);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex justify-end bg-forest-950/50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-paper shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-forest-900/10 px-6 py-5">
          <div>
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${CLASSIFICACAO_BADGE_CLASSES[lead.classificacao]}`}
            >
              {CLASSIFICACAO_LABELS[lead.classificacao]} · Score {lead.score}
            </span>
            <h2 className="mt-1.5 text-lg font-extrabold text-forest-900">{lead.empresa}</h2>
            <p className="text-sm text-ink-soft">{lead.nome}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-forest-900/5 hover:text-forest-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-6 px-6 py-5">
          <section>
            <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-ink-soft">Contato</h3>
            <InfoRow label="Telefone" value={lead.telefone} />
            <InfoRow label="E-mail" value={lead.email} />
            <InfoRow label="Cargo" value={lead.cargo} />
            <InfoRow label="Cidade" value={lead.cidade} />
            <InfoRow label="Estado" value={lead.estado} />
          </section>

          <section>
            <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-ink-soft">Empresa</h3>
            <InfoRow label="Segmento" value={lead.segmento} />
            <InfoRow label="Faturamento" value={lead.faturamento} />
            <InfoRow label="Funcionários" value={lead.funcionarios} />
            <InfoRow label="Serviço(s)" value={lead.servicos.join(", ")} />
            <InfoRow label="Urgência" value={lead.urgencia} />
            <InfoRow label="Origem" value={lead.origem} />
            <InfoRow label="Necessidade relatada" value={lead.necessidade} />
          </section>

          <section>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">
              Etapa: {STATUS_LABELS[lead.status]}
            </h3>
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-ink">Responsável</span>
                <select
                  className={fieldClass}
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                >
                  <option value="">Selecione</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.nome}>
                      {u.nome}
                    </option>
                  ))}
                  {responsavel && !usuarios.some((u) => u.nome === responsavel) && (
                    <option value={responsavel}>{responsavel}</option>
                  )}
                </select>
              </label>

              {lead.status === "em_diagnostico" && (
                <>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-ink">Problemas identificados</span>
                    <textarea className={`${fieldClass} min-h-[70px]`} value={problemasDiagnostico} onChange={(e) => setProblemasDiagnostico(e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-ink">Documentação necessária</span>
                    <textarea className={`${fieldClass} min-h-[70px]`} value={documentacaoNecessaria} onChange={(e) => setDocumentacaoNecessaria(e.target.value)} />
                  </label>
                </>
              )}

              {lead.status === "proposta_elaboracao" && (
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-ink">Valor previsto (R$)</span>
                  <input type="number" className={fieldClass} value={valorPrevisto} onChange={(e) => setValorPrevisto(e.target.value)} />
                </label>
              )}

              {lead.status === "proposta_enviada" && (
                <>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-ink">Valor da proposta (R$)</span>
                    <input type="number" className={fieldClass} value={valorProposta} onChange={(e) => setValorProposta(e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-ink">Prazo de retorno</span>
                    <input className={fieldClass} value={prazoRetorno} onChange={(e) => setPrazoRetorno(e.target.value)} />
                  </label>
                </>
              )}

              {lead.status === "negociacao" && (
                <>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-ink">Contrapropostas</span>
                    <textarea className={`${fieldClass} min-h-[70px]`} value={contrapropostas} onChange={(e) => setContrapropostas(e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-ink">Dúvidas / pendências</span>
                    <textarea className={`${fieldClass} min-h-[70px]`} value={duvidasPendencias} onChange={(e) => setDuvidasPendencias(e.target.value)} />
                  </label>
                </>
              )}

              {lead.status === "fechado_ganho" && (
                <>
                  <InfoRow label="Valor fechado" value={lead.valor_fechado ? `R$ ${lead.valor_fechado}` : null} />
                  <InfoRow label="Serviço contratado" value={lead.servico_contratado} />
                </>
              )}

              {lead.status === "perdido" && <InfoRow label="Motivo da perda" value={lead.motivo_perda} />}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-full bg-forest-900 px-5 py-2 text-sm font-semibold text-white hover:bg-forest-800 disabled:opacity-60"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Salvar etapa
              </button>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">Arquivos</h3>
            <LeadFiles leadId={lead.id} />
          </section>

          <section>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">Histórico</h3>
            {loadingEvents ? (
              <p className="text-sm text-ink-soft">Carregando...</p>
            ) : (
              <ol className="space-y-2.5 border-l border-forest-900/10 pl-4">
                {events.map((event) => (
                  <li key={event.id} className="text-sm">
                    <p className="text-ink">{eventDescription(event)}</p>
                    <p className="text-[11px] text-ink-soft">
                      {new Date(event.created_at).toLocaleString("pt-BR")}
                      {event.usuario ? ` · ${event.usuario}` : ""}
                    </p>
                  </li>
                ))}
              </ol>
            )}

            <div className="mt-3 flex gap-2">
              <input
                className={fieldClass}
                placeholder="Adicionar observação..."
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNota()}
              />
              <button
                type="button"
                onClick={handleAddNota}
                disabled={savingNota || !nota.trim()}
                className="shrink-0 rounded-lg bg-forest-900/10 px-4 py-2 text-sm font-semibold text-forest-900 hover:bg-forest-900/15 disabled:opacity-50"
              >
                Adicionar
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
