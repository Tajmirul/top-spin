import { prisma } from "@/lib/prisma";
import { MatchStatus, MatchType } from "@prisma/client";
import { calculateELO } from "@/lib/elo";

/**
 * Auto-confirm matches that are past their autoConfirmAt time
 * Can be called from cron job or on page load
 */
export async function autoConfirmExpiredMatches() {
  const now = new Date();

  // Find all pending matches that are past their autoConfirmAt time
  const matchesToConfirm = await prisma.match.findMany({
    where: {
      status: MatchStatus.PENDING,
      autoConfirmAt: {
        lte: now,
      },
    },
    include: {
      winner1: true,
      winner2: true,
      loser1: true,
      loser2: true,
    },
  });

  if (matchesToConfirm.length === 0) {
    return {
      success: true,
      confirmedCount: 0,
      failedCount: 0,
      totalChecked: 0,
    };
  }

  console.log(`Auto-confirming ${matchesToConfirm.length} expired matches`);

  let confirmedCount = 0;
  let failedCount = 0;

  // Process each match
  for (const match of matchesToConfirm) {
    try {
      // Calculate ELO changes
      const eloResult = calculateELO({
        winner1Rating: match.winner1.rating,
        loser1Rating: match.loser1.rating,
        winner2Rating: match.winner2?.rating,
        loser2Rating: match.loser2?.rating,
        matchesWon: match.winnerScore,
        matchesLost: match.loserScore,
      });

      // Update match and ratings in a transaction
      await prisma.$transaction(async (tx) => {
        // Update match status
        await tx.match.update({
          where: { id: match.id },
          data: {
            status: MatchStatus.CONFIRMED,
            confirmedAt: now,
            winner1RatingChange: eloResult.winner1Change,
            winner2RatingChange:
              "winner2Change" in eloResult ? eloResult.winner2Change : null,
            loser1RatingChange: eloResult.loser1Change,
            loser2RatingChange:
              "loser2Change" in eloResult ? eloResult.loser2Change : null,
          },
        });

        // Update player ratings
        await tx.user.update({
          where: { id: match.winner1Id },
          data: { rating: eloResult.winner1NewRating },
        });

        await tx.user.update({
          where: { id: match.loser1Id },
          data: { rating: eloResult.loser1NewRating },
        });

        if (
          match.matchType === MatchType.DOUBLES &&
          match.winner2Id &&
          match.loser2Id
        ) {
          if (
            "winner2NewRating" in eloResult &&
            "loser2NewRating" in eloResult
          ) {
            await tx.user.update({
              where: { id: match.winner2Id },
              data: { rating: eloResult.winner2NewRating },
            });

            await tx.user.update({
              where: { id: match.loser2Id },
              data: { rating: eloResult.loser2NewRating },
            });
          }
        }

        // Create rating history records
        await tx.ratingHistory.create({
          data: {
            userId: match.winner1Id,
            rating: eloResult.winner1NewRating,
            change: eloResult.winner1Change,
            matchId: match.id,
          },
        });

        await tx.ratingHistory.create({
          data: {
            userId: match.loser1Id,
            rating: eloResult.loser1NewRating,
            change: eloResult.loser1Change,
            matchId: match.id,
          },
        });

        if (
          match.matchType === MatchType.DOUBLES &&
          match.winner2Id &&
          match.loser2Id
        ) {
          if (
            "winner2NewRating" in eloResult &&
            "loser2NewRating" in eloResult
          ) {
            await tx.ratingHistory.create({
              data: {
                userId: match.winner2Id,
                rating: eloResult.winner2NewRating!,
                change: eloResult.winner2Change!,
                matchId: match.id,
              },
            });

            await tx.ratingHistory.create({
              data: {
                userId: match.loser2Id,
                rating: eloResult.loser2NewRating!,
                change: eloResult.loser2Change!,
                matchId: match.id,
              },
            });
          }
        }
      });

      confirmedCount++;
      console.log(`Auto-confirmed match ${match.id}`);
    } catch (error) {
      failedCount++;
      console.error(`Failed to auto-confirm match ${match.id}:`, error);
    }
  }

  return {
    success: true,
    confirmedCount,
    failedCount,
    totalChecked: matchesToConfirm.length,
  };
}
