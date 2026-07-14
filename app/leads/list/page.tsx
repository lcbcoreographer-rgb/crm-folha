import { getScoredLeads } from "@/app/lib/leadsData";
import CrmShell from "../CrmShell";
import LeadsTable from "./LeadsTable";

export const dynamic = "force-dynamic";

export default async function LeadsListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { leads } = await getScoredLeads();
  const { q } = await searchParams;

  return (
    <CrmShell>
      <LeadsTable initialLeads={leads} initialQuery={q || ""} />
    </CrmShell>
  );
}
