"use client";
import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Loader2 } from "lucide-react";
import type { Lead, LeadStatus } from "@/app/lib/leadTypes";
import { STATUS_ORDER, STATUS_LABELS } from "@/app/lib/leadStatus";
import LeadCard from "./LeadCard";
import FilterBar, { EMPTY_FILTERS, type LeadFilters } from "./FilterBar";
import LeadDrawer from "./LeadDrawer";

function Column({
  status,
  leads,
  onCardClick,
}: {
  status: LeadStatus;
  leads: Lead[];
  onCardClick: (lead: Lead) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-xl border p-2.5 transition-colors ${
        isOver
          ? "border-forest-700 bg-forest-50/50"
          : "border-forest-900/10 bg-paper-dim/60"
      }`}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-xs font-bold uppercase tracking-wide text-ink-soft">
          {STATUS_LABELS[status]}
        </h3>
        <span className="rounded-full bg-forest-900/10 px-2 py-0.5 text-[11px] font-bold text-forest-900">
          {leads.length}
        </span>
      </div>
      <div className="flex min-h-[80px] flex-1 flex-col gap-2 overflow-y-auto pb-1">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onClick={() => onCardClick(lead)} />
        ))}
      </div>
    </div>
  );
}

interface PendingMove {
  lead: Lead;
  status: "perdido" | "fechado_ganho";
}

export default function KanbanBoard({
  initialLeads,
  motivosPerda,
}: {
  initialLeads: Lead[];
  motivosPerda: string[];
}) {
  const [leads, setLeads] = useState(initialLeads);
  const [filters, setFilters] = useState<LeadFilters>(EMPTY_FILTERS);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [pendingSaving, setPendingSaving] = useState(false);
  const [motivoPerda, setMotivoPerda] = useState("");
  const [valorFechado, setValorFechado] = useState("");
  const [servicoContratado, setServicoContratado] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (filters.servico && !lead.servicos.includes(filters.servico)) return false;
      if (filters.segmento && lead.segmento !== filters.segmento) return false;
      if (filters.cidade && lead.cidade !== filters.cidade) return false;
      if (filters.estado && lead.estado !== filters.estado) return false;
      if (filters.responsavel && lead.responsavel !== filters.responsavel) return false;
      if (filters.classificacao && lead.classificacao !== filters.classificacao) return false;
      if (filters.dataInicio && lead.created_at < filters.dataInicio) return false;
      if (filters.dataFim && lead.created_at > `${filters.dataFim}T23:59:59`) return false;
      return true;
    });
  }, [leads, filters]);

  const columns = useMemo(() => {
    const map = new Map<LeadStatus, Lead[]>();
    for (const status of STATUS_ORDER) map.set(status, []);
    for (const lead of filteredLeads) map.get(lead.status)?.push(lead);
    return map;
  }, [filteredLeads]);

  async function persistMove(leadId: string, status: LeadStatus, extra: Record<string, unknown> = {}) {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status, ...extra } : l))
    );
    await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...extra }),
    });
  }

  function handleDragStart(event: DragStartEvent) {
    const lead = leads.find((l) => l.id === event.active.id);
    setActiveLead(lead ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;
    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    if (newStatus === "perdido" || newStatus === "fechado_ganho") {
      setMotivoPerda(lead.motivo_perda || "");
      setValorFechado(lead.valor_fechado?.toString() || "");
      setServicoContratado(lead.servico_contratado || lead.servicos.join(", "));
      setPendingMove({ lead, status: newStatus });
      return;
    }
    persistMove(leadId, newStatus);
  }

  async function confirmPendingMove() {
    if (!pendingMove) return;
    setPendingSaving(true);
    try {
      if (pendingMove.status === "perdido") {
        await persistMove(pendingMove.lead.id, "perdido", { motivo_perda: motivoPerda });
      } else {
        await persistMove(pendingMove.lead.id, "fechado_ganho", {
          valor_fechado: valorFechado ? Number(valorFechado) : null,
          servico_contratado: servicoContratado,
        });
      }
      setPendingMove(null);
    } finally {
      setPendingSaving(false);
    }
  }

  return (
    <div className="flex flex-col">
      <FilterBar leads={leads} filters={filters} onChange={setFilters} />

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto p-6">
          {STATUS_ORDER.map((status) => (
            <Column
              key={status}
              status={status}
              leads={columns.get(status) || []}
              onCardClick={setSelectedLead}
            />
          ))}
        </div>
        <DragOverlay>
          {activeLead && (
            <div className="w-72 rotate-2 opacity-95">
              <LeadCard lead={activeLead} onClick={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={(updated) => {
            setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
            setSelectedLead(updated);
          }}
        />
      )}

      {pendingMove && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-forest-950/60 p-4"
          onClick={() => setPendingMove(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            {pendingMove.status === "perdido" ? (
              <>
                <h3 className="text-lg font-extrabold text-forest-900">Motivo da perda</h3>
                <p className="mt-1 text-sm text-ink-soft">
                  Antes de mover para Perdido, selecione o motivo.
                </p>
                <select
                  className="mt-4 w-full rounded-lg border border-forest-900/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest-700"
                  value={motivoPerda}
                  onChange={(e) => setMotivoPerda(e.target.value)}
                >
                  <option value="">Selecione</option>
                  {motivosPerda.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <h3 className="text-lg font-extrabold text-forest-900">Fechar negócio</h3>
                <p className="mt-1 text-sm text-ink-soft">
                  Informe o valor fechado e o serviço contratado.
                </p>
                <label className="mt-4 block">
                  <span className="mb-1 block text-xs font-medium text-ink">Valor fechado (R$)</span>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-forest-900/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest-700"
                    value={valorFechado}
                    onChange={(e) => setValorFechado(e.target.value)}
                  />
                </label>
                <label className="mt-3 block">
                  <span className="mb-1 block text-xs font-medium text-ink">Serviço contratado</span>
                  <input
                    className="w-full rounded-lg border border-forest-900/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest-700"
                    value={servicoContratado}
                    onChange={(e) => setServicoContratado(e.target.value)}
                  />
                </label>
              </>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingMove(null)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-ink-soft hover:text-forest-900"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmPendingMove}
                disabled={
                  pendingSaving ||
                  (pendingMove.status === "perdido" ? !motivoPerda : !valorFechado)
                }
                className="inline-flex items-center gap-1.5 rounded-full bg-forest-900 px-5 py-2 text-sm font-semibold text-white hover:bg-forest-800 disabled:opacity-60"
              >
                {pendingSaving && <Loader2 size={14} className="animate-spin" />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
