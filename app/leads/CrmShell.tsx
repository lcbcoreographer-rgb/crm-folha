import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { listUsuarios, getCurrentUser } from "@/app/lib/currentUser";

export default async function CrmShell({ children }: { children: React.ReactNode }) {
  const [usuarios, currentUser] = await Promise.all([listUsuarios(true), getCurrentUser()]);

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar usuarios={usuarios} currentUser={currentUser} />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
