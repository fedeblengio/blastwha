import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaigns = await prisma.campaign.findMany({
    where: { userId: Number(session.user.id) },
    include: { _count: { select: { messages: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(campaigns);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, messageBody, mediaUrl, scheduledAt, listId } =
    await request.json();
  if (!name || !messageBody || !listId) {
    return NextResponse.json(
      { error: "name, messageBody, listId required" },
      { status: 400 }
    );
  }

  const campaign = await prisma.campaign.create({
    data: {
      name,
      messageBody,
      mediaUrl,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      listId: Number(listId),
      userId: Number(session.user.id),
    },
  });
  return NextResponse.json(campaign, { status: 201 });
}
