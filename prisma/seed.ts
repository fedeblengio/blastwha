import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@ubrabyte.com" },
    update: {},
    create: {
      email: "admin@ubrabyte.com",
      passwordHash: hash,
      nombre: "Admin",
      plan: "pro",
    },
  });
  console.log("Seed complete");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
