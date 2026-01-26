"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { MatchCard } from "@/components/match-card";
import { Match, User } from "@prisma/client";
import { useState, useEffect } from "react";
import { getLatestMatches } from "@/app/actions/match-actions";
import { ChevronLeft, ChevronRight } from "lucide-react";

type MatchWithPlayers = Match & {
  winner1: Pick<User, "id" | "name">;
  winner2: Pick<User, "id" | "name"> | null;
  loser1: Pick<User, "id" | "name">;
  loser2: Pick<User, "id" | "name"> | null;
};

export function LatestMatches() {
  const { user } = useUser();
  const currentUserId = user?.id;
  const [matches, setMatches] = useState<MatchWithPlayers[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const pageSize = 20;
  const totalPages = Math.ceil(totalCount / pageSize);
  const currentPage = page + 1;

  // Fetch matches on mount and when page changes
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const result = await getLatestMatches(page, pageSize);
        if (result.success) {
          setMatches(result.matches);
          setHasMore(result.hasMore);
          if (result.totalCount !== undefined) {
            setTotalCount(result.totalCount);
          }
        }
      } catch (error) {
        console.error("Failed to fetch matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [page]);

  if (!currentUserId) return null;

  const handlePrevious = () => {
    if (page === 0 || loading) return;
    setPage(page - 1);
  };

  const handleNext = () => {
    if (!hasMore || loading) return;
    setPage(page + 1);
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900 p-4 min-h-56">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-semibold">Latest Matches</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              size="icon-sm"
              variant="outline"
              onClick={handlePrevious}
              disabled={page === 0 || loading}
              className="border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="outline"
              onClick={handleNext}
              disabled={!hasMore || loading}
              className="border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {matches.length === 0 ? (
          <p className="text-center text-zinc-500">No matches yet</p>
        ) : (
          matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              variant="default"
              currentUserId={currentUserId}
              showAdminActions={true}
            />
          ))
        )}
      </div>
    </Card>
  );
}
