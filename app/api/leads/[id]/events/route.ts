import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/lib/supabase";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/leads/[id]/events">
) {
  const { id } = await ctx.params;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("lead_events")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[leads/events] falha ao listar:", error);
    return NextResponse.json({ error: "Falha ao buscar histórico" }, { status: 500 });
  }

  return NextResponse.json({ events: data });
}

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/leads/[id]/events">
) {
  const { id } = await ctx.params;
  const { nota } = await request.json();

  if (typeof nota !== "string" || !nota.trim()) {
    return NextResponse.json({ error: "Nota vazia" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("lead_events")
    .insert({ lead_id: id, tipo: "observacao", nota: nota.trim() })
    .select("*")
    .single();

  if (error) {
    console.error("[leads/events] falha ao criar observação:", error);
    return NextResponse.json({ error: "Falha ao salvar observação" }, { status: 500 });
  }

  return NextResponse.json({ event: data });
}
