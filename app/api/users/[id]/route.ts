import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MatchStatus } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> },
) {
  const params = await paramsPromise;

  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "20");

    const userId = params.id;

    // Fetch user basic info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        rating: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate user stats
    const totalMatches = await prisma.match.count({
      where: {
        status: MatchStatus.CONFIRMED,
        OR: [
          { winner1Id: userId },
          { winner2Id: userId },
          { loser1Id: userId },
          { loser2Id: userId },
        ],
      },
    });

    const wonMatches = await prisma.match.count({
      where: {
        status: MatchStatus.CONFIRMED,
        OR: [{ winner1Id: userId }, { winner2Id: userId }],
      },
    });

    const lostMatches = totalMatches - wonMatches;

    // Get user's rank
    const rank = await prisma.user.count({
      where: {
        rating: {
          gt: user.rating,
        },
      },
    });

    // Fetch rating history for graph
    const ratingHistory = await prisma.ratingHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: {
        rating: true,
        change: true,
        createdAt: true,
      },
    });

    // Add initial rating as first point if history exists
    const ratingGraphData =
      ratingHistory.length > 0
        ? [{ rating: 1500, createdAt: user.createdAt }, ...ratingHistory]
        : [{ rating: 1500, createdAt: user.createdAt }];

    // Fetch user's matches with pagination
    const matches = await prisma.match.findMany({
      where: {
        status: MatchStatus.CONFIRMED,
        OR: [
          { winner1Id: userId },
          { winner2Id: userId },
          { loser1Id: userId },
          { loser2Id: userId },
        ],
      },
      orderBy: { confirmedAt: "desc" },
      skip,
      take,
      include: {
        winner1: { select: { id: true, name: true, image: true } },
        winner2: { select: { id: true, name: true, image: true } },
        loser1: { select: { id: true, name: true, image: true } },
        loser2: { select: { id: true, name: true, image: true } },
      },
    });

    const hasMore = totalMatches > skip + take;

    return NextResponse.json({
      user: {
        ...user,
        rank: rank + 1,
        totalMatches,
        wonMatches,
        lostMatches,
        winRate: totalMatches > 0 ? (wonMatches / totalMatches) * 100 : 0,
      },
      ratingHistory: ratingGraphData,
      matches,
      hasMore,
    });
  } catch (error) {
    console.error("Failed to fetch user details:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 },
    );
  }
}
