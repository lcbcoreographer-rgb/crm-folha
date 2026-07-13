import { getSupabaseAdmin } from "@/app/lib/supabase";
import type { Lead } from "@/app/lib/leadTypes";
import LeadsNav from "./LeadsNav";
import KanbanBoard from "./KanbanBoard";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[leads] falha ao carregar leads:", error);
  }

  return (
    <>
      <LeadsNav />
      <KanbanBoard initialLeads={(data as Lead[]) || []} />
    </>
  );
}
