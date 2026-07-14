import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/lib/supabase";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("usuarios").select("*").order("nome", { ascending: true });
  if (error) {
    console.error("[usuarios] falha ao listar:", error);
    return NextResponse.json({ error: "Falha ao listar usuários" }, { status: 500 });
  }
  return NextResponse.json({ usuarios: data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  if (!nome) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("usuarios")
    .insert({ nome, avatar_url: body.avatar_url || null })
    .select("*")
    .single();
  if (error) {
    console.error("[usuarios] falha ao criar:", error);
    return NextResponse.json({ error: "Falha ao criar usuário" }, { status: 500 });
  }
  return NextResponse.json({ usuario: data });
}
