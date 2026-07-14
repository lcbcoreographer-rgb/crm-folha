import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/lib/supabase";
import { getCurrentUser } from "@/app/lib/currentUser";

const ALLOWED_FIELDS = [
  "status",
  "responsavel",
  "valor_previsto",
  "valor_proposta",
  "valor_fechado",
  "servico_contratado",
  "motivo_perda",
  "detalhes",
  "funcionarios",
] as const;

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/leads/[id]">
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const supabase = getSupabaseAdmin();

  const updates: Record<string, unknown> = {};
  for (const field of ALLOWED_FIELDS) {
    if (field in body) updates[field] = body[field];
  }

  let previousStatus: string | null = null;
  if ("status" in updates) {
    const { data: current } = await supabase
      .from("leads")
      .select("status")
      .eq("id", id)
      .single();
    previousStatus = (current?.status as string | undefined) ?? null;
  }

  const { data, error } = await supabase
    .from("leads")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("[leads] falha ao atualizar:", error);
    return NextResponse.json({ error: "Falha ao atualizar lead" }, { status: 500 });
  }

  if ("status" in updates && previousStatus !== updates.status) {
    const currentUser = await getCurrentUser();
    const { error: eventError } = await supabase.from("lead_events").insert({
      lead_id: id,
      tipo: "mudanca_status",
      de_status: previousStatus,
      para_status: updates.status,
      usuario: currentUser?.nome ?? null,
    });
    if (eventError) {
      console.error("[leads] falha ao registrar evento:", eventError);
    }
  }

  if (updates.status === "fechado_ganho" && previousStatus !== "fechado_ganho" && data) {
    const { data: existingCliente } = await supabase
      .from("clientes")
      .select("id")
      .eq("lead_id", id)
      .maybeSingle();

    const clientePayload = {
      lead_id: id,
      empresa: data.empresa,
      contato: data.nome,
      telefone: data.telefone,
      whatsapp: data.telefone,
      email: data.email,
      servico_contratado: data.servico_contratado || data.servicos?.join(", ") || null,
      valor: data.valor_fechado,
      responsavel: data.responsavel,
    };

    if (existingCliente) {
      const { error: clienteError } = await supabase
        .from("clientes")
        .update(clientePayload)
        .eq("id", existingCliente.id);
      if (clienteError) console.error("[leads] falha ao atualizar cliente:", clienteError);
    } else {
      const { error: clienteError } = await supabase.from("clientes").insert(clientePayload);
      if (clienteError) console.error("[leads] falha ao criar cliente:", clienteError);
    }
  }

  return NextResponse.json({ lead: data });
}
