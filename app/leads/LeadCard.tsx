"use client";
import { useDraggable } from "@dnd-kit/core";
import type { Lead } from "@/app/lib/leadTypes";
import {
  CLASSIFICACAO_BADGE_CLASSES,
  CLASSIFICACAO_CARD_CLASSES,
  CLASSIFICACAO_LABELS,
} from "@/app/lib/leadStatus";

export default function LeadCard({
  lead,
  onClick,
}: {
  lead: Lead;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: lead.id });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 10,
      }
    : undefined;

  const dataEntrada = new Date(lead.created_at).toLocaleDateString("pt-BR");

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`cursor-pointer rounded-xl border p-3.5 text-left shadow-sm transition-all hover:shadow-md ${
        isDragging
          ? "border-dashed border-forest-700/50 bg-paper-dim/50 opacity-50 shadow-none"
          : `${CLASSIFICACAO_CARD_CLASSES[lead.classificacao]}`
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-bold text-forest-900 line-clamp-1">
          {lead.empresa}
        </span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${CLASSIFICACAO_BADGE_CLASSES[lead.classificacao]}`}
        >
          {CLASSIFICACAO_LABELS[lead.classificacao]}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-ink-soft line-clamp-1">{lead.nome}</p>
      {lead.servicos.length > 0 && (
        <p className="mt-2 text-xs text-ink line-clamp-2">
          {lead.servicos.join(", ")}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between text-[11px] text-ink-soft">
        <span>Score {lead.score}</span>
        <span>{dataEntrada}</span>
      </div>
      {lead.responsavel && (
        <div className="mt-1.5 truncate text-[11px] font-medium text-forest-700">
          {lead.responsavel}
        </div>
      )}
    </div>
  );
}
