import { getClientes } from "@/app/lib/clientesData";
import CrmShell from "../CrmShell";
import ClientesTable from "./ClientesTable";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <CrmShell>
      <ClientesTable initialClientes={clientes} />
    </CrmShell>
  );
}
