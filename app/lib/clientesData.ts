import "server-only";
import { getSupabaseAdmin } from "./supabase";
import type { Cliente } from "./crmTypes";

export async function getClientes(): Promise<Cliente[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[clientes] falha ao listar:", error);
    return [];
  }
  return (data as Cliente[]) || [];
}
