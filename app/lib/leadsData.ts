import "server-only";
import { getSupabaseAdmin } from "./supabase";
import { getCrmConfig } from "./crmConfig";
import { applyScore } from "./scoreEngine";
import type { Lead } from "./leadTypes";
import type { CrmConfig } from "./crmTypes";

export async function getScoredLeads(): Promise<{ leads: Lead[]; config: CrmConfig }> {
  const supabase = getSupabaseAdmin();
  const [{ data, error }, config] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    getCrmConfig(),
  ]);

  if (error) {
    console.error("[leads] falha ao carregar leads:", error);
    return { leads: [], config };
  }

  const leads = ((data as Lead[]) || []).map((lead) => applyScore(lead, config));
  return { leads, config };
}
