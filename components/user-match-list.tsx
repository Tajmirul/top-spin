"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { getUserMatches } from "@/app/actions/user-actions";
import { MatchCard } from "@/components/match-card";
import { ExtendedMatch } from "@/types/match";

interface UserMatchListProps {
  userId: string;
  initialMatches: ExtendedMatch[];
  hasMore: boolean;
}

export function UserMatchList({
  userId,
  initialMatches,
  hasMore: initialHasMore,
}: UserMatchListProps) {
  const [matches, setMatches] = useState<ExtendedMatch[]>(initialMatches);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    setLoading(true);
    try {
      const data = await getUserMatches(userId, matches.length, 10);

      setMatches([...matches, ...data.matches]);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Failed to load more matches:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900 p-4">
      <h2 className="font-serif text-xl font-semibold">Match History</h2>

      <div className="space-y-3">
        {matches.length === 0 ? (
          <p className="text-center text-zinc-500">No matches yet</p>
        ) : (
          <>
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                variant="user-history"
                currentUserId={userId}
              />
            ))}

            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={loadMore}
                  disabled={loading}
                  variant="outline"
                  className="border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                >
                  {loading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
