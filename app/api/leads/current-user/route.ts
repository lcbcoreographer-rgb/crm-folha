import { NextResponse } from "next/server";
import { CURRENT_USER_COOKIE } from "@/app/lib/currentUser";

export async function POST(request: Request) {
  const { usuarioId } = await request.json();
  const response = NextResponse.json({ ok: true });
  if (typeof usuarioId === "string" && usuarioId) {
    response.cookies.set(CURRENT_USER_COOKIE, usuarioId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  } else {
    response.cookies.delete(CURRENT_USER_COOKIE);
  }
  return response;
}
