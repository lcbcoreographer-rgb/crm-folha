import { NextResponse } from "next/server";
import { getCrmConfig, updateCrmConfig } from "@/app/lib/crmConfig";

export async function GET() {
  const config = await getCrmConfig();
  return NextResponse.json({ config });
}

export async function PATCH(request: Request) {
  const patch = await request.json();
  try {
    const config = await updateCrmConfig(patch);
    return NextResponse.json({ config });
  } catch (error) {
    console.error("[config] falha ao atualizar:", error);
    return NextResponse.json({ error: "Falha ao salvar configuração" }, { status: 500 });
  }
}
