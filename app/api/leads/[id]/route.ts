import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/lib/supabase";

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
    const { error: eventError } = await supabase.from("lead_events").insert({
      lead_id: id,
      tipo: "mudanca_status",
      de_status: previousStatus,
      para_status: updates.status,
    });
    if (eventError) {
      console.error("[leads] falha ao registrar evento:", eventError);
    }
  }

  return NextResponse.json({ lead: data });
}
