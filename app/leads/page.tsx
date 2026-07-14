import { getScoredLeads } from "@/app/lib/leadsData";
import CrmShell from "./CrmShell";
import KanbanBoard from "./KanbanBoard";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const { leads, config } = await getScoredLeads();

  return (
    <CrmShell>
      <KanbanBoard initialLeads={leads} motivosPerda={config.motivosPerda} />
    </CrmShell>
  );
}
