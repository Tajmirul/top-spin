import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopRankings } from "@/components/top-rankings";
import { LatestMatches } from "@/components/latest-matches";
import { PendingMatches } from "@/components/pending-matches";
import { AdminPanel } from "@/components/admin-panel";
import { MatchStatus, UserRole } from "@prisma/client";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  // Fetch top 8 ranked players
  const topPlayers = await prisma.user.findMany({
    take: 8,
    orderBy: { rating: "desc" },
  });

  // Find current user's rank
  const currentUserRank = await prisma.user.count({
    where: {
      rating: {
        gt: session!.user.rating,
      },
    },
  });

  // Fetch pending matches that need user's approval
  const pendingMatches = await prisma.match.findMany({
    where: {
      status: MatchStatus.PENDING,
      OR:
        session?.user.role === UserRole.ADMIN
          ? undefined
          : [
              { winner1Id: userId },
              { winner2Id: userId },
              { loser1Id: userId },
              { loser2Id: userId },
            ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      matchType: true,
      winnerScore: true,
      loserScore: true,
      createdAt: true,
      autoConfirmAt: true,
      submittedById: true,
      winner1: { select: { id: true, name: true, image: true } },
      winner2: { select: { id: true, name: true, image: true } },
      loser1: { select: { id: true, name: true, image: true } },
      loser2: { select: { id: true, name: true, image: true } },
    },
  });

  return (
    <div className="space-y-4">
      {/* Admin Panel - Only visible to admins */}
      {session!.user.role === UserRole.ADMIN && <AdminPanel />}

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
        <div className="xl:col-span-3 space-y-4">
          <PendingMatches matches={pendingMatches} />
          <LatestMatches />
        </div>
        <div className="xl:col-span-2">
          <TopRankings
            players={topPlayers}
            currentUserRank={currentUserRank + 1}
          />
        </div>
      </div>
    </div>
  );
}
