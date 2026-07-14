import { getCrmConfig } from "@/app/lib/crmConfig";
import { listUsuarios } from "@/app/lib/currentUser";
import CrmShell from "../CrmShell";
import ConfiguracoesPanel from "./ConfiguracoesPanel";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const [config, usuarios] = await Promise.all([getCrmConfig(), listUsuarios(false)]);

  return (
    <CrmShell>
      <ConfiguracoesPanel initialConfig={config} initialUsuarios={usuarios} />
    </CrmShell>
  );
}
