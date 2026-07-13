import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel de Leads | Folha Soluções Ambientais",
  robots: { index: false, follow: false },
};

export default function LeadsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen bg-paper-dim text-ink">{children}</div>;
}
