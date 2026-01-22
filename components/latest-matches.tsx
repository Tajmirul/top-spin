"use client"

import { Card } from "@/components/ui/card"
import { useUser } from "@/hooks/useUser"
import { MatchCard } from "@/components/match-card"
import { Match, User } from "@prisma/client"

interface LatestMatchesProps {
  matches: (Match & {
    winner1: Pick<User, "id" | "name">;
    winner2: Pick<User, "id" | "name"> | null;
    loser1: Pick<User, "id" | "name">;
    loser2: Pick<User, "id" | "name"> | null;
  })[]
}

export function LatestMatches({ matches }: LatestMatchesProps) {
  const { user } = useUser()
  const currentUserId = user?.id

  if (!currentUserId) return null

  return (
    <Card className="border-zinc-800 bg-zinc-900 p-4">
      <h2 className="font-serif text-xl font-semibold">
        Latest Matches
      </h2>

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
            />
          ))
        )}
      </div>
    </Card>
  )
}
