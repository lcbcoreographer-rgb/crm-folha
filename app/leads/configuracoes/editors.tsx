"use client";
import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";

export interface PontosRow {
  label: string;
  pontos: number;
}

const fieldClass =
  "w-full rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-ink outline-none transition-colors focus:border-forest-700";

export function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <h3 className="text-sm font-extrabold text-ink">{title}</h3>
      {description && <p className="mt-0.5 text-xs text-ink-soft">{description}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function PontosEditor({
  rows,
  onSave,
}: {
  rows: PontosRow[];
  onSave: (rows: PontosRow[]) => Promise<void>;
}) {
  const [items, setItems] = useState(rows);
  const [saving, setSaving] = useState(false);

  function updateRow(i: number, patch: Partial<PontosRow>) {
    setItems((prev) => prev.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }

  function removeRow(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addRow() {
    setItems((prev) => [...prev, { label: "", pontos: 0 }]);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const cleaned = items.filter((row) => row.label.trim());
      await onSave(cleaned);
      setItems(cleaned);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      {items.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            className={fieldClass}
            value={row.label}
            onChange={(e) => updateRow(i, { label: e.target.value })}
            placeholder="Nome"
          />
          <input
            type="number"
            className={`${fieldClass} w-24 shrink-0`}
            value={row.pontos}
            onChange={(e) => updateRow(i, { pontos: Number(e.target.value) })}
          />
          <button
            type="button"
            onClick={() => removeRow(i)}
            className="shrink-0 rounded-lg p-1.5 text-ink-soft hover:bg-paper-dim hover:text-red-600"
            aria-label="Remover"
          >
            <X size={15} />
          </button>
        </div>
      ))}

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 hover:text-forest-800"
        >
          <Plus size={14} /> Adicionar
        </button>
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
    </div>
  );
}

export function StringListEditor({
  values,
  onSave,
}: {
  values: string[];
  onSave: (values: string[]) => Promise<void>;
}) {
  const [items, setItems] = useState(values);
  const [saving, setSaving] = useState(false);

  function updateItem(i: number, value: string) {
    setItems((prev) => prev.map((v, idx) => (idx === i ? value : v)));
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const cleaned = items.map((v) => v.trim()).filter(Boolean);
      await onSave(cleaned);
      setItems(cleaned);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      {items.map((value, i) => (
        <div key={i} className="flex items-center gap-2">
          <input className={fieldClass} value={value} onChange={(e) => updateItem(i, e.target.value)} />
          <button
            type="button"
            onClick={() => removeItem(i)}
            className="shrink-0 rounded-lg p-1.5 text-ink-soft hover:bg-paper-dim hover:text-red-600"
            aria-label="Remover"
          >
            <X size={15} />
          </button>
        </div>
      ))}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, ""])}
          className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 hover:text-forest-800"
        >
          <Plus size={14} /> Adicionar
        </button>
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
    </div>
  );
}
