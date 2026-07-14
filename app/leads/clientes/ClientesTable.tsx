"use client";
import { useState } from "react";
import { Loader2, X } from "lucide-react";
import type { Cliente, ClienteStatus } from "@/app/lib/crmTypes";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_LABELS: Record<ClienteStatus, string> = {
  ativo: "Ativo",
  pausado: "Pausado",
  encerrado: "Encerrado",
};

const STATUS_BADGE: Record<ClienteStatus, string> = {
  ativo: "bg-forest-100 text-forest-700",
  pausado: "bg-amber-100 text-amber-700",
  encerrado: "bg-gray-200 text-gray-600",
};

export default function ClientesTable({ initialClientes }: { initialClientes: Cliente[] }) {
  const [clientes, setClientes] = useState(initialClientes);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [observacoes, setObservacoes] = useState("");
  const [status, setStatus] = useState<ClienteStatus>("ativo");
  const [saving, setSaving] = useState(false);

  function openEditor(cliente: Cliente) {
    setEditing(cliente);
    setObservacoes(cliente.observacoes || "");
    setStatus(cliente.status);
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/clientes/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ observacoes, status }),
      });
      const data = await res.json();
      if (data.cliente) {
        setClientes((prev) => prev.map((c) => (c.id === data.cliente.id ? data.cliente : c)));
        setEditing(null);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-white px-6 py-4">
        <h1 className="text-lg font-extrabold text-ink">Clientes</h1>
        <span className="text-sm text-ink-soft">{clientes.length} cliente(s)</span>
      </div>

      <div className="overflow-x-auto px-6 py-4">
        <table className="w-full min-w-[1000px] border-separate border-spacing-0 overflow-hidden rounded-xl border border-border bg-white text-sm shadow-sm">
          <thead>
            <tr className="bg-paper-dim text-left text-xs font-bold uppercase tracking-wide text-ink-soft">
              {["Empresa", "Contato", "Telefone", "E-mail", "Serviço contratado", "Valor", "Início", "Responsável", "Status"].map(
                (col) => (
                  <th key={col} className="whitespace-nowrap border-b border-border px-3 py-2.5">
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-ink-soft">
                  Nenhum cliente ainda. Clientes aparecem aqui automaticamente quando um lead é fechado no Kanban.
                </td>
              </tr>
            )}
            {clientes.map((cliente) => (
              <tr
                key={cliente.id}
                onClick={() => openEditor(cliente)}
                className="cursor-pointer border-b border-border last:border-0 hover:bg-paper-dim/60"
              >
                <td className="whitespace-nowrap px-3 py-2.5 font-medium text-ink">{cliente.empresa}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">{cliente.contato || "-"}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">{cliente.telefone || "-"}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">{cliente.email || "-"}</td>
                <td className="max-w-[180px] truncate px-3 py-2.5 text-ink-soft">{cliente.servico_contratado || "-"}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">
                  {cliente.valor ? currency.format(cliente.valor) : "-"}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">
                  {new Date(cliente.data_inicio).toLocaleDateString("pt-BR")}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-ink-soft">{cliente.responsavel || "-"}</td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_BADGE[cliente.status]}`}>
                    {STATUS_LABELS[cliente.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setEditing(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-extrabold text-ink">{editing.empresa}</h3>
              <button onClick={() => setEditing(null)} className="text-ink-soft hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <label className="mb-3 block">
              <span className="mb-1 block text-xs font-medium text-ink">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ClienteStatus)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink outline-none focus:border-forest-700"
              >
                {(Object.keys(STATUS_LABELS) as ClienteStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink">Observações</span>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="min-h-[90px] w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink outline-none focus:border-forest-700"
              />
            </label>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-ink-soft hover:text-ink"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-full bg-forest-700 px-5 py-2 text-sm font-semibold text-white hover:bg-forest-800 disabled:opacity-60"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
