"use client";

import { Card } from "@/components/ui/card";
import { Trophy, Medal } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import Image from "next/image";
import Link from "next/link";
import { getPlayerTier, getTierBadgeClasses } from "@/lib/tiers";
import { User } from "@prisma/client";

interface TopRankingsProps {
  players: User[];
  currentUserRank: number;
}

export function TopRankings({ players, currentUserRank }: TopRankingsProps) {
  const { user } = useUser();
  const currentUserId = user?.id;

  if (!currentUserId) return null;
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-zinc-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
    return null;
  };

  const isCurrentUser = (playerId: string) => playerId === currentUserId;

  return (
    <Card className="border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold">Top Rankings</h2>
        <Link href="/users" className="text-sm hover:text-primary hover:underline">
          All Users
        </Link>
      </div>

      <div className="space-y-3">
        {players.map((player, index) => {
          const rank = index + 1;
          const highlighted = isCurrentUser(player.id);
          const playerTier = getPlayerTier(player.rating);

          return (
            <Link
              href={`/players/${player.id}`}
              key={player.id}
              className={`flex items-center gap-4 p-3 transition-colors cursor-pointer ${
                highlighted
                  ? "bg-primary/10 ring-2 ring-primary/20 hover:bg-primary/20"
                  : "bg-zinc-800/50 hover:bg-zinc-800"
              }`}
            >
              {/* Rank */}
              <div className="flex w-8 items-center justify-center">
                {getRankIcon(rank) || (
                  <span className="text-lg font-semibold text-zinc-400">
                    {rank}
                  </span>
                )}
              </div>

              {/* Avatar */}
              {player.image ? (
                <Image
                  src={player.image}
                  alt={player.name || player.email}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full border-2 border-zinc-700"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 text-sm font-semibold text-white">
                  {player.name?.charAt(0)}
                </div>
              )}

              {/* Name */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{player.name}</span>
                  <span
                    className={`text-xs size-5 inline-flex items-center justify-center rounded-full ${getTierBadgeClasses(playerTier)}`}
                  >
                    {playerTier.emoji}
                  </span>
                </div>
                <div className="text-xs text-zinc-400">{playerTier.label}</div>
              </div>

              {/* Rating */}
              <div className="text-right">
                <div className="text-lg font-semibold text-primary">
                  {player.rating}
                </div>
                <div className="text-xs text-zinc-500">rating</div>
              </div>
            </Link>
          );
        })}

        {/* Current user rank if not in top 8 */}
        {!players.some((p) => p.id === currentUserId) && (
          <div className="mt-4 border-t border-zinc-700 pt-4">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span>Your current rank:</span>
              <span className="font-semibold text-primary">
                #{currentUserRank}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
