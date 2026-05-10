const WAHA_URL = process.env.WAHA_API_URL || "http://localhost:3000";

export async function sendWhatsAppMessage(
  sessionId: string,
  phone: string,
  text: string
) {
  const res = await fetch(`${WAHA_URL}/api/sendText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session: sessionId,
      chatId: `${phone}@c.us`,
      text,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WAHA error: ${err}`);
  }
  return res.json();
}

export async function getSessionStatus(sessionId: string) {
  const res = await fetch(`${WAHA_URL}/api/sessions/${sessionId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function startSession(sessionId: string) {
  const res = await fetch(`${WAHA_URL}/api/sessions/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: sessionId }),
  });
  return res.json();
}

export async function getQR(sessionId: string) {
  const res = await fetch(`${WAHA_URL}/api/sessions/${sessionId}/auth/qr`, {
    headers: { Accept: "image/png" },
  });
  if (!res.ok) return null;
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}
