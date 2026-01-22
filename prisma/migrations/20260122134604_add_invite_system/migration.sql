/*
  Warnings:

  - Added the required column `expiresAt` to the `Challenge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "challengedId2" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "matchType" "MatchType" NOT NULL DEFAULT 'SINGLES',
ADD COLUMN     "partnerId" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Challenge_challengedId2_idx" ON "Challenge"("challengedId2");

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_challengedId2_fkey" FOREIGN KEY ("challengedId2") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
