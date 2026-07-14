"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LeadsLoginPage() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/leads/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });
      if (!res.ok) {
        setError("Senha inválida.");
        return;
      }
      router.push("/leads");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-forest-900/10 bg-white p-8 shadow-lg"
      >
        <Image
          src="/logo.png"
          alt="Folha Soluções Ambientais"
          width={56}
          height={56}
          className="mx-auto mb-5 rounded-xl"
        />
        <h1 className="text-center text-xl font-extrabold text-forest-900">
          Painel de Leads
        </h1>
        <p className="mt-1 text-center text-sm text-ink-soft">
          Folha Soluções Ambientais
        </p>

        <label className="mt-6 block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Senha</span>
          <input
            type="password"
            autoFocus
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full rounded-lg border border-forest-900/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-forest-700 focus:ring-2 focus:ring-forest-700/15"
          />
        </label>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || !senha}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-800 disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Entrar
        </button>
      </form>
    </div>
  );
}
