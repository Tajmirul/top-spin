/*
  Warnings:

  - You are about to drop the column `loserId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `loserRatingChange` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `winnerId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `winnerRatingChange` on the `Match` table. All the data in the column will be lost.
  - Added the required column `loser1Id` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `winner1Id` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('SINGLES', 'DOUBLES');

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_loserId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_winnerId_fkey";

-- DropIndex
DROP INDEX "Match_loserId_idx";

-- DropIndex
DROP INDEX "Match_winnerId_idx";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "loserId",
DROP COLUMN "loserRatingChange",
DROP COLUMN "winnerId",
DROP COLUMN "winnerRatingChange",
ADD COLUMN     "loser1Id" TEXT NOT NULL,
ADD COLUMN     "loser1RatingChange" INTEGER,
ADD COLUMN     "loser2Id" TEXT,
ADD COLUMN     "loser2RatingChange" INTEGER,
ADD COLUMN     "matchType" "MatchType" NOT NULL DEFAULT 'SINGLES',
ADD COLUMN     "winner1Id" TEXT NOT NULL,
ADD COLUMN     "winner1RatingChange" INTEGER,
ADD COLUMN     "winner2Id" TEXT,
ADD COLUMN     "winner2RatingChange" INTEGER;

-- CreateIndex
CREATE INDEX "Match_winner1Id_idx" ON "Match"("winner1Id");

-- CreateIndex
CREATE INDEX "Match_loser1Id_idx" ON "Match"("loser1Id");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winner1Id_fkey" FOREIGN KEY ("winner1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winner2Id_fkey" FOREIGN KEY ("winner2Id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_loser1Id_fkey" FOREIGN KEY ("loser1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_loser2Id_fkey" FOREIGN KEY ("loser2Id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
