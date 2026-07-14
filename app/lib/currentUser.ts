import "server-only";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "./supabase";
import type { Usuario } from "./crmTypes";

export const CURRENT_USER_COOKIE = "folha_leads_user";

export async function getCurrentUser(): Promise<Usuario | null> {
  const cookieStore = await cookies();
  const id = cookieStore.get(CURRENT_USER_COOKIE)?.value;
  if (!id) return null;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("usuarios").select("*").eq("id", id).maybeSingle();
  return (data as Usuario) || null;
}

export async function listUsuarios(onlyActive = false): Promise<Usuario[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase.from("usuarios").select("*").order("nome", { ascending: true });
  if (onlyActive) query = query.eq("ativo", true);
  const { data, error } = await query;
  if (error) {
    console.error("[usuarios] falha ao listar:", error);
    return [];
  }
  return (data as Usuario[]) || [];
}
