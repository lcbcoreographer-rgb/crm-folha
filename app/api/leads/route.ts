import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/lib/supabase";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[leads] falha ao listar:", error);
    return NextResponse.json({ error: "Falha ao buscar leads" }, { status: 500 });
  }

  return NextResponse.json({ leads: data });
}
