export const LEADS_SESSION_COOKIE = "folha_leads_session";

async function sha256Hex(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getSecret() {
  const password = process.env.LEADS_PANEL_PASSWORD;
  const secret = process.env.LEADS_SESSION_SECRET;
  if (!password || !secret) {
    throw new Error(
      "Painel de leads não configurado: defina LEADS_PANEL_PASSWORD e LEADS_SESSION_SECRET."
    );
  }
  return { password, secret };
}

export async function checkPassword(input: string) {
  const { password } = getSecret();
  return input === password;
}

export async function createSessionCookieValue() {
  const { password, secret } = getSecret();
  return sha256Hex(`${password}:${secret}`);
}

export async function isValidSession(value: string | undefined) {
  if (!value) return false;
  const expected = await createSessionCookieValue();
  return value === expected;
}
