import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { RatingGraph } from "@/components/rating-graph";
import { UserMatchList } from "@/components/user-match-list";
import { getPlayerTier, getTierBadgeClasses } from "@/lib/tiers";
import { Trophy, Target, TrendingUp } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getUserDetails } from "@/app/actions/user-actions";

export default async function UserDetailsPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  const session = await auth();

  if (!session) {
    return notFound();
  }

  let user, ratingHistory, matches, hasMore;

  try {
    const result = await getUserDetails(id);

    user = result.user;
    ratingHistory = result.ratingHistory;
    matches = result.matches;
    hasMore = result.hasMore;
  } catch {
    return notFound();
  }

  const tier = getPlayerTier(user.rating);
  const tierClasses = getTierBadgeClasses(tier);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* User Header Card */}
      <Card className="border-zinc-800 bg-zinc-900 p-4">
        <div className="flex items-start gap-6">
          {/* Profile Image */}
          <div className="relative h-16 w-16 shrink-0">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || user.email}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h1 className="font-serif text-3xl font-bold text-white">
                {user.name}
              </h1>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${tierClasses}`}
              >
                {tier.emoji} {tier.label}
              </span>
            </div>
            <p className="text-zinc-400">{user.email}</p>
          </div>
        </div>
      </Card>

      {/* Rating History and Stats */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Rating Graph - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RatingGraph data={ratingHistory} currentRating={user.rating} />
        </div>

        {/* Stats Cards - Takes 1 column */}
        <div className="space-y-4">
          {/* Rank */}
          <Card className="border-zinc-800 bg-zinc-900 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <div className="text-sm text-zinc-400">Rank</div>
                <div className="text-2xl font-bold text-white">
                  #{user.rank}
                </div>
              </div>
            </div>
          </Card>

          {/* Rating */}
          <Card className="border-zinc-800 bg-zinc-900 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-sm text-zinc-400">Rating</div>
                <div className="text-2xl font-bold text-primary">
                  {user.rating}
                </div>
              </div>
            </div>
          </Card>

          {/* Win Rate */}
          <Card className="border-zinc-800 bg-zinc-900 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <Target className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-sm text-zinc-400">Win Rate</div>
                <div className="text-2xl font-bold text-white">
                  {user.winRate.toFixed(0)}%
                </div>
              </div>
            </div>
          </Card>

          {/* Total Matches */}
          <Card className="border-zinc-800 bg-zinc-900 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                <span className="text-2xl font-bold text-blue-500">🏓</span>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Matches</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-white">
                    {user.totalMatches}
                  </div>
                  <div className="text-xs text-zinc-500">
                    ({user.wonMatches}W-{user.lostMatches}L)
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Match History */}
      <UserMatchList
        userId={user.id}
        initialMatches={matches}
        hasMore={hasMore}
      />
    </div>
  );
}
