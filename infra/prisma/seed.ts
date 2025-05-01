// Here, we can seed the database with data
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.findMany();

  if (roles.length === 0) {
    await prisma.role.create({
      data: { name: "student" },
    });
    await prisma.role.create({
      data: { name: "professor" },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
