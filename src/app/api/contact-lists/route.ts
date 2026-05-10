import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lists = await prisma.contactList.findMany({
    where: { userId: Number(session.user.id) },
    include: { _count: { select: { contacts: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(lists);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await request.json();
  if (!name)
    return NextResponse.json({ error: "Name required" }, { status: 400 });

  const list = await prisma.contactList.create({
    data: { name, userId: Number(session.user.id) },
  });
  return NextResponse.json(list, { status: 201 });
}
