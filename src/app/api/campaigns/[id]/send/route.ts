import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/waha";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function interpolate(
  template: string,
  contact: { name?: string | null; phone: string }
) {
  return template
    .replace(/\{\{nombre\}\}/g, contact.name || "")
    .replace(/\{\{telefono\}\}/g, contact.phone);
}

export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
  });
  if (!user?.waSessionId || !user.waConnected) {
    return NextResponse.json(
      { error: "WhatsApp not connected" },
      { status: 400 }
    );
  }

  const campaign = await prisma.campaign.findFirst({
    where: { id: Number(id), userId: user.id },
  });
  if (!campaign)
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  if (campaign.status === "sending" || campaign.status === "completed") {
    return NextResponse.json(
      { error: "Campaign already sent" },
      { status: 400 }
    );
  }

  const contacts = await prisma.contact.findMany({
    where: { listId: campaign.listId, optedOut: false },
  });

  await prisma.campaignMessage.createMany({
    data: contacts.map((c) => ({
      campaignId: campaign.id,
      contactId: c.id,
      status: "queued" as const,
    })),
    skipDuplicates: true,
  });

  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { status: "sending" },
  });

  // Fire and forget — send in background
  (async () => {
    const messages = await prisma.campaignMessage.findMany({
      where: { campaignId: campaign.id, status: "queued" },
      include: { contact: true },
    });

    for (const msg of messages) {
      try {
        await prisma.campaignMessage.update({
          where: { id: msg.id },
          data: { status: "sending" },
        });
        const text = interpolate(campaign.messageBody, msg.contact);
        await sendWhatsAppMessage(user.waSessionId!, msg.contact.phone, text);
        await prisma.campaignMessage.update({
          where: { id: msg.id },
          data: { status: "sent", sentAt: new Date() },
        });
      } catch (e) {
        await prisma.campaignMessage.update({
          where: { id: msg.id },
          data: { status: "failed", error: (e as Error).message },
        });
      }
      await sleep(3000);
    }

    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: "completed" },
    });
  })();

  return NextResponse.json({ status: "sending", totalContacts: contacts.length });
}
