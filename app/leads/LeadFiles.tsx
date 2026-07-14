"use client";
import { useEffect, useState } from "react";
import { Loader2, Paperclip, Trash2, Upload } from "lucide-react";
import type { LeadFile } from "@/app/lib/crmTypes";

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LeadFiles({ leadId }: { leadId: string }) {
  const [files, setFiles] = useState<LeadFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`/api/leads/${leadId}/files`)
      .then((res) => res.json())
      .then((data) => setFiles(data.files || []))
      .finally(() => setLoading(false));
  }, [leadId]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/leads/${leadId}/files`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.file) setFiles((prev) => [data.file, ...prev]);
    } finally {
      setUploading(false);
    }
  }

  async function handleOpen(file: LeadFile) {
    const res = await fetch(`/api/leads/${leadId}/files/${file.id}`);
    const data = await res.json();
    if (data.url) window.open(data.url, "_blank");
  }

  async function handleDelete(file: LeadFile) {
    await fetch(`/api/leads/${leadId}/files/${file.id}`, { method: "DELETE" });
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
  }

  return (
    <div className="space-y-2">
      {loading ? (
        <p className="text-sm text-ink-soft">Carregando...</p>
      ) : (
        <>
          {files.length === 0 && <p className="text-sm text-ink-soft">Nenhum arquivo anexado.</p>}
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-forest-900/10 px-3 py-2 text-sm"
            >
              <button
                type="button"
                onClick={() => handleOpen(file)}
                className="flex min-w-0 items-center gap-2 text-left text-ink hover:text-forest-700"
              >
                <Paperclip size={14} className="shrink-0" />
                <span className="truncate">{file.filename}</span>
                <span className="shrink-0 text-[11px] text-ink-soft">{formatSize(file.size)}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(file)}
                className="shrink-0 text-ink-soft hover:text-red-600"
                aria-label="Remover arquivo"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </>
      )}

      <label className="mt-2 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-forest-900/20 px-3 py-2 text-xs font-semibold text-forest-700 hover:bg-forest-50">
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        {uploading ? "Enviando..." : "Anexar arquivo"}
        <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>
    </div>
  );
}
