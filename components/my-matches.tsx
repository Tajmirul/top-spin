"use client";

import { Card } from "@/components/ui/card";
import { useUser } from "@/hooks/useUser";
import { MatchCard } from "@/components/match-card";
import { ExtendedMatch } from "@/types/match";

interface MyMatchesProps {
  matches: ExtendedMatch[];
}

export function MyMatches({ matches }: MyMatchesProps) {
  const { user } = useUser();
  const currentUserId = user?.id;

  if (!currentUserId) return null;

  return (
    <Card className="border-zinc-800 bg-zinc-900 p-4">
      <h2 className="font-serif text-xl font-semibold">My Recent Matches</h2>

      <div className="space-y-3">
        {matches.length === 0 ? (
          <p className="text-center text-zinc-500">
            No matches yet. Challenge someone to get started!
          </p>
        ) : (
          matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              variant="user-focused"
              currentUserId={currentUserId}
              showAdminActions={true}
            />
          ))
        )}
      </div>
    </Card>
  );
}
