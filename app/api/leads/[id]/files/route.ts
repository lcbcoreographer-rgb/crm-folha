import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/lib/supabase";
import { getCurrentUser } from "@/app/lib/currentUser";

const MAX_SIZE = 15 * 1024 * 1024;

export async function GET(_request: Request, ctx: RouteContext<"/api/leads/[id]/files">) {
  const { id } = await ctx.params;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("lead_files")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[leads/files] falha ao listar:", error);
    return NextResponse.json({ error: "Falha ao listar arquivos" }, { status: 500 });
  }
  return NextResponse.json({ files: data });
}

export async function POST(request: Request, ctx: RouteContext<"/api/leads/[id]/files">) {
  const { id } = await ctx.params;
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Arquivo maior que 15MB" }, { status: 400 });
  }

  const currentUser = await getCurrentUser();
  const supabase = getSupabaseAdmin();
  const path = `${id}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage.from("lead-files").upload(path, file);
  if (uploadError) {
    console.error("[leads/files] falha no upload:", uploadError);
    return NextResponse.json({ error: "Falha ao enviar arquivo" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("lead_files")
    .insert({
      lead_id: id,
      path,
      filename: file.name,
      size: file.size,
      uploaded_by: currentUser?.nome ?? null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("[leads/files] falha ao registrar:", error);
    return NextResponse.json({ error: "Falha ao registrar arquivo" }, { status: 500 });
  }
  return NextResponse.json({ file: data });
}
