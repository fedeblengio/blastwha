import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await prisma.template.findMany({
    where: { userId: Number(session.user.id) },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, body } = await request.json();
  if (!name || !body)
    return NextResponse.json(
      { error: "Name and body required" },
      { status: 400 }
    );

  const template = await prisma.template.create({
    data: { name, body, userId: Number(session.user.id) },
  });
  return NextResponse.json(template, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  await prisma.template.delete({
    where: { id, userId: Number(session.user.id) },
  });
  return NextResponse.json({ ok: true });
}
