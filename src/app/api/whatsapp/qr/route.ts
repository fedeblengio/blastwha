import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getQR } from "@/lib/waha";

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
  });
  if (!user?.waSessionId)
    return NextResponse.json({ error: "No session" }, { status: 400 });

  const qr = await getQR(user.waSessionId);
  if (!qr)
    return NextResponse.json({ error: "QR not available" }, { status: 404 });

  return NextResponse.json({ qr: `data:image/png;base64,${qr}` });
}
