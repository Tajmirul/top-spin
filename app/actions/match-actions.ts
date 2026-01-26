"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MatchType, MatchStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { calculateELO } from "@/lib/elo";
import { sendMatchSubmissionNotification } from "@/lib/email";

export interface SubmitMatchResultParams {
  matchType: MatchType;
  matchesWon: number;
  matchesLost: number;
  // Singles
  player1Id?: string;
  player2Id?: string;
  // Doubles
  team1Player1Id?: string;
  team1Player2Id?: string;
  team2Player1Id?: string;
  team2Player2Id?: string;
}

export async function submitMatchResult(params: SubmitMatchResultParams) {
  try {
    const session = await auth();

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const {
      matchType,
      matchesWon,
      matchesLost,
      player1Id,
      player2Id,
      team1Player1Id,
      team1Player2Id,
      team2Player1Id,
      team2Player2Id,
    } = params;

    // Validate required fields
    if (!matchType || matchesWon === undefined || matchesLost === undefined) {
      return { success: false, error: "Missing required fields" };
    }

    // Validate at least one match played
    if (matchesWon === 0 && matchesLost === 0) {
      return { success: false, error: "At least one match must be played" };
    }

    // Determine winner and loser based on who won more matches
    const didUserWin = matchesWon > matchesLost;
    let winner1Id: string,
      winner2Id: string | undefined,
      loser1Id: string,
      loser2Id: string | undefined;

    if (matchType === MatchType.SINGLES) {
      if (!player1Id || !player2Id) {
        return { success: false, error: "Singles match requires both players" };
      }

      winner1Id = didUserWin ? player1Id : player2Id;
      loser1Id = didUserWin ? player2Id : player1Id;
    } else {
      // Doubles
      if (
        !team1Player1Id ||
        !team1Player2Id ||
        !team2Player1Id ||
        !team2Player2Id
      ) {
        return {
          success: false,
          error: "Doubles match requires all 4 players",
        };
      }

      winner1Id = didUserWin ? team1Player1Id : team2Player1Id;
      winner2Id = didUserWin ? team1Player2Id : team2Player2Id;
      loser1Id = didUserWin ? team2Player1Id : team1Player1Id;
      loser2Id = didUserWin ? team2Player2Id : team1Player2Id;
    }

    // Ensure the logged-in user is part of the match (unless admin)
    const userIds = [winner1Id, winner2Id, loser1Id, loser2Id].filter(Boolean);
    if (
      session.user.role !== UserRole.ADMIN &&
      !userIds.includes(session.user.id)
    ) {
      return {
        success: false,
        error: "You must be a participant in the match",
      };
    }

    const isAdmin = session.user.role === UserRole.ADMIN;

    // Fetch player ratings for ELO calculation (needed for admin auto-confirm)
    let winner1Rating: number,
      winner2Rating: number | undefined,
      loser1Rating: number,
      loser2Rating: number | undefined;

    if (isAdmin) {
      const players = await prisma.user.findMany({
        where: {
          id: { in: userIds as string[] },
        },
        select: { id: true, rating: true },
      });

      const playerMap = new Map(players.map((p) => [p.id, p.rating]));
      winner1Rating = playerMap.get(winner1Id)!;
      loser1Rating = playerMap.get(loser1Id)!;
      if (winner2Id) winner2Rating = playerMap.get(winner2Id);
      if (loser2Id) loser2Rating = playerMap.get(loser2Id);
    }

    // Admin submits = auto-confirm immediately
    if (isAdmin) {
      // Calculate ELO changes
      const eloResult = calculateELO({
        winner1Rating: winner1Rating!,
        loser1Rating: loser1Rating!,
        winner2Rating: winner2Rating,
        loser2Rating: loser2Rating,
        matchesWon: Math.max(matchesWon, matchesLost),
        matchesLost: Math.min(matchesWon, matchesLost),
      });

      // Create confirmed match with rating changes in a transaction
      const match = await prisma.$transaction(async (tx) => {
        // Create match
        const createdMatch = await tx.match.create({
          data: {
            matchType,
            submittedById: session.user.id,
            winner1Id,
            winner2Id: winner2Id || null,
            loser1Id,
            loser2Id: loser2Id || null,
            winnerScore: Math.max(matchesWon, matchesLost),
            loserScore: Math.min(matchesWon, matchesLost),
            status: MatchStatus.CONFIRMED,
            confirmedAt: new Date(),
            autoConfirmAt: new Date(), // Set to now since it's already confirmed
            winner1RatingChange: eloResult.winner1Change,
            winner2RatingChange:
              "winner2Change" in eloResult ? eloResult.winner2Change : null,
            loser1RatingChange: eloResult.loser1Change,
            loser2RatingChange:
              "loser2Change" in eloResult ? eloResult.loser2Change : null,
          },
          include: {
            winner1: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                rating: true,
              },
            },
            winner2: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                rating: true,
              },
            },
            loser1: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                rating: true,
              },
            },
            loser2: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                rating: true,
              },
            },
            submittedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        // Update player ratings
        await tx.user.update({
          where: { id: winner1Id },
          data: { rating: eloResult.winner1NewRating },
        });

        await tx.user.update({
          where: { id: loser1Id },
          data: { rating: eloResult.loser1NewRating },
        });

        if (matchType === MatchType.DOUBLES && winner2Id && loser2Id) {
          if (
            "winner2NewRating" in eloResult &&
            "loser2NewRating" in eloResult &&
            eloResult.winner2NewRating !== undefined &&
            eloResult.loser2NewRating !== undefined
          ) {
            await tx.user.update({
              where: { id: winner2Id },
              data: { rating: eloResult.winner2NewRating },
            });

            await tx.user.update({
              where: { id: loser2Id },
              data: { rating: eloResult.loser2NewRating },
            });
          }
        }

        // Create rating history records
        await tx.ratingHistory.create({
          data: {
            userId: winner1Id,
            rating: eloResult.winner1NewRating,
            change: eloResult.winner1Change,
            matchId: createdMatch.id,
          },
        });

        await tx.ratingHistory.create({
          data: {
            userId: loser1Id,
            rating: eloResult.loser1NewRating,
            change: eloResult.loser1Change,
            matchId: createdMatch.id,
          },
        });

        if (matchType === MatchType.DOUBLES && winner2Id && loser2Id) {
          if (
            "winner2NewRating" in eloResult &&
            "loser2NewRating" in eloResult &&
            eloResult.winner2NewRating !== undefined &&
            eloResult.loser2NewRating !== undefined &&
            eloResult.winner2Change !== undefined &&
            eloResult.loser2Change !== undefined
          ) {
            await tx.ratingHistory.create({
              data: {
                userId: winner2Id,
                rating: eloResult.winner2NewRating,
                change: eloResult.winner2Change,
                matchId: createdMatch.id,
              },
            });

            await tx.ratingHistory.create({
              data: {
                userId: loser2Id,
                rating: eloResult.loser2NewRating,
                change: eloResult.loser2Change,
                matchId: createdMatch.id,
              },
            });
          }
        }

        return createdMatch;
      });

      // Revalidate relevant paths
      revalidatePath("/dashboard");
      revalidatePath("/players");

      return { success: true, match };
    }

    // Regular user submission - create pending match
    // Create match with auto-confirm 48 hours from now
    const autoConfirmAt = new Date();
    autoConfirmAt.setHours(autoConfirmAt.getHours() + 48);

    const match = await prisma.match.create({
      data: {
        matchType,
        submittedById: session.user.id,
        winner1Id,
        winner2Id: winner2Id || null,
        loser1Id,
        loser2Id: loser2Id || null,
        winnerScore: Math.max(matchesWon, matchesLost),
        loserScore: Math.min(matchesWon, matchesLost),
        status: "PENDING",
        autoConfirmAt,
      },
      include: {
        winner1: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            rating: true,
          },
        },
        winner2: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            rating: true,
          },
        },
        loser1: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            rating: true,
          },
        },
        loser2: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            rating: true,
          },
        },
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Send email notifications to all participants (except submitter)
    try {
      const recipientEmails: string[] = [];

      // Collect all participant emails
      if (match.winner1.email && match.winner1.id !== session.user.id) {
        recipientEmails.push(match.winner1.email);
      }
      if (match.winner2?.email && match.winner2.id !== session.user.id) {
        recipientEmails.push(match.winner2.email);
      }
      if (match.loser1.email && match.loser1.id !== session.user.id) {
        recipientEmails.push(match.loser1.email);
      }
      if (match.loser2?.email && match.loser2.id !== session.user.id) {
        recipientEmails.push(match.loser2.email);
      }

      if (recipientEmails.length > 0) {
        await sendMatchSubmissionNotification(
          {
            matchType: match.matchType,
            submitterName: match.submittedBy?.name || "Someone",
            submitterEmail: match.submittedBy?.email || "",
            winner1Name: match.winner1.name || match.winner1.email,
            winner2Name: match.winner2?.name || match.winner2?.email,
            loser1Name: match.loser1.name || match.loser1.email,
            loser2Name: match.loser2?.name || match.loser2?.email,
            winnerScore: match.winnerScore,
            loserScore: match.loserScore,
          },
          recipientEmails,
        );
      }
    } catch (emailError) {
      console.error("Failed to send email notifications:", emailError);
      // Don't fail the match creation if email fails
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/players");

    return { success: true, match };
  } catch (error) {
    console.error("Failed to create match:", error);
    return { success: false, error: "Failed to create match" };
  }
}

export async function getAllUserMatches(userId?: string) {
  try {
    const session = await auth();

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const targetUserId = userId || session.user.id;

    // Get all matches (including pending) where user is involved
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { winner1Id: targetUserId },
          { winner2Id: targetUserId },
          { loser1Id: targetUserId },
          { loser2Id: targetUserId },
        ],
      },
      include: {
        winner1: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            rating: true,
          },
        },
        winner2: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            rating: true,
          },
        },
        loser1: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            rating: true,
          },
        },
        loser2: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            rating: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return { success: true, matches };
  } catch (error) {
    console.error("Failed to fetch matches:", error);
    return { success: false, error: "Failed to fetch matches" };
  }
}

export async function confirmMatch(matchId: string) {
  try {
    const session = await auth();

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // Fetch the match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        winner1: true,
        winner2: true,
        loser1: true,
        loser2: true,
      },
    });

    if (!match) {
      return { success: false, error: "Match not found" };
    }

    // Check if match is already confirmed
    if (match.status === MatchStatus.CONFIRMED) {
      return { success: false, error: "Match already confirmed" };
    }

    // Check if user is part of the match
    const userIds = [
      match.winner1Id,
      match.winner2Id,
      match.loser1Id,
      match.loser2Id,
    ].filter(Boolean);

    if (
      session.user.role !== UserRole.ADMIN &&
      !userIds.includes(session.user.id)
    ) {
      return { success: false, error: "You are not part of this match" };
    }

    const eloResult = calculateELO({
      winner1Rating: match.winner1.rating,
      loser1Rating: match.loser1.rating,
      winner2Rating: match.winner2?.rating,
      loser2Rating: match.loser2?.rating,
      matchesWon: match.winnerScore,
      matchesLost: match.loserScore,
    });

    // Update match status and rating changes
    await prisma.$transaction(async (tx) => {
      // Update match
      await tx.match.update({
        where: { id: matchId },
        data: {
          status: MatchStatus.CONFIRMED,
          confirmedAt: new Date(),
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
        if ("winner2NewRating" in eloResult && "loser2NewRating" in eloResult) {
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
          matchId,
        },
      });

      await tx.ratingHistory.create({
        data: {
          userId: match.loser1Id,
          rating: eloResult.loser1NewRating,
          change: eloResult.loser1Change,
          matchId,
        },
      });

      if (
        match.matchType === MatchType.DOUBLES &&
        match.winner2Id &&
        match.loser2Id
      ) {
        if ("winner2NewRating" in eloResult && "loser2NewRating" in eloResult) {
          await tx.ratingHistory.create({
            data: {
              userId: match.winner2Id,
              rating: eloResult.winner2NewRating!,
              change: eloResult.winner2Change!,
              matchId,
            },
          });

          await tx.ratingHistory.create({
            data: {
              userId: match.loser2Id,
              rating: eloResult.loser2NewRating!,
              change: eloResult.loser2Change!,
              matchId,
            },
          });
        }
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/players");

    return { success: true };
  } catch (error) {
    console.error("Failed to confirm match:", error);
    return { success: false, error: "Failed to confirm match" };
  }
}

export async function rejectMatch(matchId: string) {
  try {
    const session = await auth();

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // Fetch the match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return { success: false, error: "Match not found" };
    }

    // Check if match is already processed
    if (match.status !== MatchStatus.PENDING) {
      return { success: false, error: "Match is not pending" };
    }

    // Check if user is part of the match
    const userIds = [
      match.winner1Id,
      match.winner2Id,
      match.loser1Id,
      match.loser2Id,
    ].filter(Boolean);

    if (!userIds.includes(session.user.id)) {
      return { success: false, error: "You are not part of this match" };
    }

    // Update match status to REJECTED
    await prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.REJECTED,
      },
    });

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to reject match:", error);
    return { success: false, error: "Failed to reject match" };
  }
}
