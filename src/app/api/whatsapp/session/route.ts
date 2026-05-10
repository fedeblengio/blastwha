import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startSession, getSessionStatus } from "@/lib/waha";

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
  });
  if (!user?.waSessionId)
    return NextResponse.json({ connected: false });

  const status = await getSessionStatus(user.waSessionId);
  const connected = status?.status === "WORKING";

  if (user.waConnected !== connected) {
    await prisma.user.update({
      where: { id: user.id },
      data: { waConnected: connected },
    });
  }

  return NextResponse.json({ connected, sessionId: user.waSessionId });
}

export async function POST() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessionId = `blastwha-${session.user.id}`;
  await startSession(sessionId);
  await prisma.user.update({
    where: { id: Number(session.user.id) },
    data: { waSessionId: sessionId },
  });

  return NextResponse.json({ sessionId });
}
