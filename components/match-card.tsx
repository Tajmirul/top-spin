"use client";

import { Match, MatchType, UserRole } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { User } from "next-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { revertMatch } from "@/app/actions/match-actions";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";

interface MatchCardProps {
  match: Match & {
    winner1: Pick<User, "id" | "name">;
    winner2: Pick<User, "id" | "name"> | null;
    loser1: Pick<User, "id" | "name">;
    loser2: Pick<User, "id" | "name"> | null;
  };
  variant?: "default" | "user-focused" | "user-history";
  currentUserId?: string;
  showAdminActions?: boolean;
}

export function MatchCard({
  match,
  variant = "default",
  currentUserId,
  showAdminActions = false,
}: MatchCardProps) {
  const { user } = useUser();
  const [isReverting, setIsReverting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleRevert = async () => {
    setShowConfirmDialog(false);
    setIsReverting(true);
    try {
      const result = await revertMatch(match.id);
      if (result.success) {
        toast.success("Match reverted successfully");
      } else {
        toast.error(result.error || "Failed to revert match");
      }
    } catch (error) {
      console.error("Failed to revert match:", error);
      toast.error("Failed to revert match");
    } finally {
      setIsReverting(false);
    }
  };

  const isUserWinner = () => {
    if (!currentUserId) return false;
    return [match.winner1Id, match.winner2Id].includes(currentUserId);
  };

  const isUserInMatch = () => {
    if (!currentUserId) return false;
    return [
      match.winner1Id,
      match.winner2Id,
      match.loser1Id,
      match.loser2Id,
    ].includes(currentUserId);
  };

  const getUserRatingChange = () => {
    if (!currentUserId) return null;
    if (match.winner1Id === currentUserId) return match.winner1RatingChange;
    if (match.winner2Id === currentUserId) return match.winner2RatingChange;
    if (match.loser1Id === currentUserId) return match.loser1RatingChange;
    if (match.loser2Id === currentUserId) return match.loser2RatingChange;
    return null;
  };

  const getOpponentNames = () => {
    if (!currentUserId) return "";
    const won = isUserWinner();
    if (match.matchType === MatchType.SINGLES) {
      return won ? match.loser1.name : match.winner1.name;
    }
    const opponents = won
      ? [match.loser1, match.loser2].filter(Boolean)
      : [match.winner1, match.winner2].filter(Boolean);
    return opponents.map((p) => p!.name).join(" & ");
  };

  const getOpponentId = () => {
    if (!currentUserId) return match.loser1.id;
    const won = isUserWinner();
    return won ? match.loser1.id : match.winner1.id;
  };

  const getPartnerName = () => {
    if (!currentUserId || match.matchType === "SINGLES") return null;
    const won = isUserWinner();
    if (won) {
      return match.winner1.id === currentUserId
        ? match.winner2?.name
        : match.winner1.name;
    } else {
      return match.loser1.id === currentUserId
        ? match.loser2?.name
        : match.loser1.name;
    }
  };

  // Determine styling based on variant
  const getCardClassName = () => {
    if (variant === "default") {
      const highlighted = isUserInMatch();
      return highlighted
        ? "bg-primary/10 ring-2 ring-primary/20"
        : "bg-zinc-800/50 hover:bg-zinc-800";
    }
    if (variant === "user-focused") {
      const won = isUserWinner();
      return won
        ? "bg-primary/5 ring-2 ring-primary/10"
        : "bg-red-900/10 ring-2 ring-red-900/20";
    }
    if (variant === "user-history") {
      const won = isUserWinner();
      return won
        ? "bg-green-500/10 ring-2 ring-green-500/20"
        : "bg-red-500/10 ring-2 ring-red-500/20";
    }
    return "bg-zinc-800/50";
  };

  // Render different content based on variant
  const renderMatchContent = () => {
    if (variant === "user-focused" || variant === "user-history") {
      const won = isUserWinner();
      const partner = getPartnerName();
      const ratingChange = getUserRatingChange();

      return (
        <>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-semibold ${
                  won ? "text-green-500" : "text-red-500"
                }`}
              >
                {won ? "WIN" : "LOSS"}
              </span>
              <span className="text-white">
                vs{" "}
                <Link
                  href={`/players/${getOpponentId()}`}
                  className="hover:underline"
                >
                  {getOpponentNames()}
                </Link>
              </span>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
              <span>
                {match.winnerScore} - {match.loserScore}
              </span>
              {partner && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span>with {partner}</span>
                </>
              )}
              {variant === "user-history" && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="capitalize">
                    {match.matchType.toLowerCase()}
                  </span>
                </>
              )}
              <span className="text-zinc-600">•</span>
              <span>
                {match.confirmedAt
                  ? formatDistanceToNow(new Date(match.confirmedAt), {
                      addSuffix: true,
                    })
                  : "Just now"}
              </span>
            </div>
          </div>

          {ratingChange !== null && (
            <div className="text-right">
              <div
                className={`text-lg font-bold ${
                  ratingChange > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {ratingChange > 0 ? "+" : ""}
                {ratingChange}
              </div>
              <div className="text-xs text-zinc-500">Rating</div>
            </div>
          )}
        </>
      );
    }

    // Default variant
    return (
      <>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm">
            {match.matchType === "SINGLES" ? (
              <Link
                href={`/players/${match.winner1.id}`}
                className="text-green-500 font-medium hover:underline"
              >
                {match.winner1.name}
              </Link>
            ) : (
              <span className="text-green-500 font-medium">
                <Link
                  href={`/players/${match.winner1.id}`}
                  className="hover:underline"
                >
                  {match.winner1.name}
                </Link>
                {" & "}
                <Link
                  href={`/players/${match.winner2!.id}`}
                  className="hover:underline"
                >
                  {match.winner2!.name}
                </Link>
              </span>
            )}
            <span className="text-zinc-500">defeated</span>
            {match.matchType === "SINGLES" ? (
              <Link
                href={`/players/${match.loser1.id}`}
                className="text-red-500 font-medium hover:underline"
              >
                {match.loser1.name}
              </Link>
            ) : (
              <span className="text-red-500 font-medium">
                <Link
                  href={`/players/${match.loser1.id}`}
                  className="hover:underline"
                >
                  {match.loser1.name}
                </Link>
                {" & "}
                <Link
                  href={`/players/${match.loser2!.id}`}
                  className="hover:underline"
                >
                  {match.loser2!.name}
                </Link>
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
            <span>
              {match.winnerScore} - {match.loserScore}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="capitalize">{match.matchType.toLowerCase()}</span>
            <span className="text-zinc-600">•</span>
            <span>
              {match.confirmedAt
                ? formatDistanceToNow(new Date(match.confirmedAt), {
                    addSuffix: true,
                  })
                : "Just now"}
            </span>
          </div>
        </div>

        {match.winner1RatingChange !== null && (
          <div className="text-right text-xs">
            <div className="text-green-500">+{match.winner1RatingChange}</div>
            <div className="text-red-500">{match.loser1RatingChange}</div>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <div className={`p-4 ${getCardClassName()}`}>
        <div className="flex items-center justify-between gap-4">
          {renderMatchContent()}
          
          {showAdminActions && user?.role === UserRole.ADMIN && match.status === "CONFIRMED" && (
            <Button
              size="icon-sm"
              variant="destructive"
              onClick={() => setShowConfirmDialog(true)}
              disabled={isReverting}
              title="Revert match (admin only)"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="font-serif text-white">Revert Match?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              This will permanently delete the match and restore all player ratings to their previous values. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevert}
              disabled={isReverting}
            >
              {isReverting ? "Reverting..." : "Revert Match"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
