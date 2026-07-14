import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/lib/supabase";

const ALLOWED_FIELDS = ["nome", "avatar_url", "ativo"] as const;

export async function PATCH(request: Request, ctx: RouteContext<"/api/leads/usuarios/[id]">) {
  const { id } = await ctx.params;
  const body = await request.json();
  const supabase = getSupabaseAdmin();

  const updates: Record<string, unknown> = {};
  for (const field of ALLOWED_FIELDS) {
    if (field in body) updates[field] = body[field];
  }

  const { data, error } = await supabase
    .from("usuarios")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("[usuarios] falha ao atualizar:", error);
    return NextResponse.json({ error: "Falha ao atualizar usuário" }, { status: 500 });
  }
  return NextResponse.json({ usuario: data });
}
