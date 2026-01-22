"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { MatchType } from "@prisma/client";
import { toast } from "sonner";
import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { confirmMatch, rejectMatch } from "@/app/actions/match-actions";

interface Player {
  id: string;
  name: string | null;
  image: string | null;
}

interface Match {
  id: string;
  matchType: MatchType;
  winnerScore: number;
  loserScore: number;
  createdAt: Date;
  autoConfirmAt: Date;
  submittedById: string | null;
  winner1: Player;
  winner2: Player | null;
  loser1: Player;
  loser2: Player | null;
}

interface PendingMatchesProps {
  matches: Match[];
}

export function PendingMatches({ matches }: PendingMatchesProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { user } = useUser();
  const userId = user?.id;

  const isUserSubmitter = (match: Match) => {
    return match.submittedById === userId;
  };

  const getTeamPlayers = (match: Match, isWinning: boolean) => {
    if (isWinning) {
      return [match.winner1, match.winner2].filter(Boolean) as Player[];
    }
    return [match.loser1, match.loser2].filter(Boolean) as Player[];
  };

  const handleConfirm = async (matchId: string) => {
    setProcessingId(matchId);
    try {
      const result = await confirmMatch(matchId);

      if (result.success) {
        toast.success("Match confirmed!");
      } else {
        toast.error(result.error || "Failed to confirm match");
      }
    } catch (error) {
      console.error("Failed to confirm match:", error);
      toast.error("Failed to confirm match");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (matchId: string) => {
    setProcessingId(matchId);
    try {
      const result = await rejectMatch(matchId);

      if (result.success) {
        toast.success("Match rejected");
      } else {
        toast.error(result.error || "Failed to reject match");
      }
    } catch (error) {
      console.error("Failed to reject match:", error);
      toast.error("Failed to reject match");
    } finally {
      setProcessingId(null);
    }
  };

  const getTimeRemaining = (autoConfirmAt: Date) => {
    const now = new Date();
    const remaining = autoConfirmAt.getTime() - now.getTime();
    const hours = Math.floor(remaining / (1000 * 60 * 60));

    if (hours < 1) {
      const minutes = Math.floor(remaining / (1000 * 60));
      return `${minutes}m`;
    }
    return `${hours}h`;
  };

  if (matches.length === 0) {
    return null;
  }

  return (
    <Card className="lg:max-w-[calc(50%-0.5rem)]">
      <CardHeader>
        <CardTitle className="font-serif text-xl">
          Pending Confirmations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {matches.map((match) => {
            const userIsSubmitter = isUserSubmitter(match);
            const winningTeam = getTeamPlayers(match, true);
            const losingTeam = getTeamPlayers(match, false);

            return (
              <div
                key={match.id}
                className="flex items-center justify-between border border-zinc-800 bg-zinc-900/50 p-4 rounded"
              >
                <div className="flex-1">
                  {/* Teams */}
                  <div className="flex items-center gap-4 text-sm">
                    {/* Winning Team */}
                    <div className="flex items-center gap-2">
                      {winningTeam.map((player, index) => (
                        <div
                          key={player.id}
                          className="flex items-center gap-1"
                        >
                          {index > 0 && (
                            <span className="text-zinc-600">+</span>
                          )}

                          <span
                            className={
                              player.id === userId
                                ? "font-semibold text-white"
                                : "text-zinc-400"
                            }
                          >
                            {player.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary">
                        {match.winnerScore}
                      </span>
                      <span className="text-zinc-600">-</span>
                      <span className="font-semibold text-red-400">
                        {match.loserScore}
                      </span>
                    </div>

                    {/* Losing Team */}
                    <div className="flex items-center gap-2">
                      {losingTeam.map((player, index) => (
                        <div
                          key={player.id}
                          className="flex items-center gap-1"
                        >
                          {index > 0 && (
                            <span className="text-zinc-600">+</span>
                          )}
                          <span
                            className={
                              player.id === userId
                                ? "font-semibold text-white"
                                : "text-zinc-400"
                            }
                          >
                            {player.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      Auto-confirms in {getTimeRemaining(match.autoConfirmAt)}
                    </span>
                    {userIsSubmitter && <span>• You reported this result</span>}
                  </div>
                </div>

                {/* Actions - Only show for users who didn't report the result */}
                {!userIsSubmitter && (
                  <div className="flex gap-2">
                    <Button
                      size="icon-sm"
                      onClick={() => handleConfirm(match.id)}
                      disabled={processingId === match.id}
                    >
                      <CheckCircle />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      onClick={() => handleReject(match.id)}
                      disabled={processingId === match.id}
                    >
                      <XCircle />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
