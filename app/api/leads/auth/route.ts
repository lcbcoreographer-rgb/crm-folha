import { NextResponse } from "next/server";
import {
  checkPassword,
  createSessionCookieValue,
  LEADS_SESSION_COOKIE,
} from "@/app/lib/leadsAuth";

export async function POST(request: Request) {
  const { senha } = await request.json();

  if (typeof senha !== "string" || !(await checkPassword(senha))) {
    return NextResponse.json({ ok: false, error: "Senha inválida" }, { status: 401 });
  }

  const value = await createSessionCookieValue();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(LEADS_SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
