import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const campaign = await prisma.campaign.findFirst({
    where: { id: Number(id), userId: Number(session.user.id) },
    include: {
      messages: {
        include: { contact: { select: { phone: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!campaign)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(campaign);
}
