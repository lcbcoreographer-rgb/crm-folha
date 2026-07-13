import { NextResponse } from "next/server";
import { LEADS_SESSION_COOKIE } from "@/app/lib/leadsAuth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(LEADS_SESSION_COOKIE);
  return response;
}
