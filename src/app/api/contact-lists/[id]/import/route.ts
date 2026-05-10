import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file)
    return NextResponse.json({ error: "CSV file required" }, { status: 400 });

  const text = await file.text();
  const lines = text.split("\n").filter(Boolean);
  const header = lines[0].toLowerCase();
  const cols = header.split(",").map((h) => h.trim());
  const phoneIdx = cols.findIndex(
    (h) => h.includes("phone") || h.includes("telefono") || h.includes("tel")
  );
  const nameIdx = cols.findIndex(
    (h) => h.includes("name") || h.includes("nombre")
  );

  if (phoneIdx === -1)
    return NextResponse.json(
      { error: "CSV must have a phone/telefono column" },
      { status: 400 }
    );

  const contacts = lines
    .slice(1)
    .map((line) => {
      const values = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      return {
        phone: values[phoneIdx],
        name: nameIdx >= 0 ? values[nameIdx] : null,
        tags: [],
        listId: Number(id),
      };
    })
    .filter((c) => c.phone);

  const result = await prisma.contact.createMany({
    data: contacts,
    skipDuplicates: true,
  });
  return NextResponse.json({ imported: result.count }, { status: 201 });
}
