-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "submittedById" TEXT;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
