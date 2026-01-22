import { prisma } from "@/lib/prisma";

async function main() {
  // Update existing matches to set submittedById to winner1Id (reasonable default)
  const result = await prisma.$executeRaw`
    UPDATE "Match"
    SET "submittedById" = "winner1Id"
    WHERE "submittedById" IS NULL
  `;

  console.log(`Updated ${result} matches with submittedById`);
}

main();
