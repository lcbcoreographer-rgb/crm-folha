import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/lib/supabase";

export async function GET(_request: Request, ctx: RouteContext<"/api/leads/[id]/files/[fileId]">) {
  const { fileId } = await ctx.params;
  const supabase = getSupabaseAdmin();

  const { data: fileRow, error: fileError } = await supabase
    .from("lead_files")
    .select("path")
    .eq("id", fileId)
    .single();

  if (fileError || !fileRow) {
    return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
  }

  const { data, error } = await supabase.storage.from("lead-files").createSignedUrl(fileRow.path, 60);
  if (error || !data) {
    console.error("[leads/files] falha ao gerar link:", error);
    return NextResponse.json({ error: "Falha ao gerar link" }, { status: 500 });
  }
  return NextResponse.json({ url: data.signedUrl });
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/leads/[id]/files/[fileId]">) {
  const { fileId } = await ctx.params;
  const supabase = getSupabaseAdmin();

  const { data: fileRow, error: fileError } = await supabase
    .from("lead_files")
    .select("path")
    .eq("id", fileId)
    .single();

  if (fileError || !fileRow) {
    return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
  }

  await supabase.storage.from("lead-files").remove([fileRow.path]);

  const { error } = await supabase.from("lead_files").delete().eq("id", fileId);
  if (error) {
    console.error("[leads/files] falha ao remover:", error);
    return NextResponse.json({ error: "Falha ao remover arquivo" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
