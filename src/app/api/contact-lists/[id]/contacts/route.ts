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

  const contacts = await prisma.contact.findMany({
    where: { listId: Number(id), list: { userId: Number(session.user.id) } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(contacts);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const list = await prisma.contactList.findFirst({
    where: { id: Number(id), userId: Number(session.user.id) },
  });
  if (!list)
    return NextResponse.json({ error: "List not found" }, { status: 404 });

  const { phone, name, tags } = await request.json();
  if (!phone)
    return NextResponse.json({ error: "Phone required" }, { status: 400 });

  const contact = await prisma.contact.create({
    data: { phone, name, tags: tags || [], listId: Number(id) },
  });
  return NextResponse.json(contact, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { contactId } = await request.json();
  await prisma.contact.delete({
    where: {
      id: contactId,
      list: { id: Number(id), userId: Number(session.user.id) },
    },
  });
  return NextResponse.json({ ok: true });
}
