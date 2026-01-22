"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Users, User, Check } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import Image from "next/image";
import { MatchType } from "@prisma/client";
import { getPlayerTier, getTierBadgeClasses } from "@/lib/tiers";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  email: string;
  image: string | null;
  rating: number;
}

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChallengeModal({ isOpen, onClose }: ChallengeModalProps) {
  const { user } = useUser();
  const [matchType, setMatchType] = useState<MatchType>(MatchType.SINGLES);
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<string>("");
  const [selectedOpponents, setSelectedOpponents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchPlayers();
    }
  }, [isOpen]);

  const fetchPlayers = async () => {
    try {
      const response = await fetch("/api/players");
      const data = await response.json();
      setPlayers(data.players.filter((p: Player) => p.id !== user!.id));
    } catch (error) {
      console.error("Failed to fetch players:", error);
    }
  };

  const filteredPlayers = players.filter(
    (player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async () => {
    if (matchType === MatchType.SINGLES && selectedOpponents.length === 0) {
      alert("Please select an opponent");
      return;
    }

    if (
      matchType === MatchType.DOUBLES &&
      (selectedOpponents.length !== 2 || !selectedPartner)
    ) {
      alert("Please select 1 partner and 2 opponents for doubles");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchType,
          challengedId: selectedOpponents[0],
          challengedId2:
            matchType === MatchType.DOUBLES ? selectedOpponents[1] : undefined,
          partnerId:
            matchType === MatchType.DOUBLES ? selectedPartner : undefined,
          message,
        }),
      });

      if (response.ok) {
        alert("Challenge sent!");
        onClose();
        resetForm();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to send challenge");
      }
    } catch (error) {
      console.error("Failed to send challenge:", error);
      alert("Failed to send challenge");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMatchType(MatchType.SINGLES);
    setSelectedOpponents([]);
    setSelectedPartner("");
    setMessage("");
    setSearchTerm("");
  };

  const handleSelectPartner = (playerId: string) => {
    setSelectedPartner(playerId === selectedPartner ? "" : playerId);
  };

  const handleSelectOpponent = (playerId: string) => {
    const maxOpponents = matchType === MatchType.SINGLES ? 1 : 2;

    if (selectedOpponents.includes(playerId)) {
      setSelectedOpponents(selectedOpponents.filter((id) => id !== playerId));
    } else if (selectedOpponents.length < maxOpponents) {
      setSelectedOpponents([...selectedOpponents, playerId]);
    }
  };

  const handleMatchTypeChange = (newMatchType: MatchType) => {
    setMatchType(newMatchType);
    setSelectedOpponents([]);
    setSelectedPartner("");
  };

  const getPlayerById = (id: string) => players.find((p) => p.id === id);

  const calculateWinProbability = () => {
    if (selectedOpponents.length === 0 || !user) return null;

    let yourTeamRating: number;
    let opponentTeamRating: number;

    if (matchType === MatchType.SINGLES) {
      yourTeamRating = user.rating;
      const opponent = getPlayerById(selectedOpponents[0]);
      if (!opponent) return null;
      opponentTeamRating = opponent.rating;
    } else {
      // Doubles
      const partner = getPlayerById(selectedPartner);
      if (!partner || selectedOpponents.length !== 2) return null;

      yourTeamRating = (user.rating + partner.rating) / 2;

      const opponent1 = getPlayerById(selectedOpponents[0]);
      const opponent2 = getPlayerById(selectedOpponents[1]);
      if (!opponent1 || !opponent2) return null;

      opponentTeamRating = (opponent1.rating + opponent2.rating) / 2;
    }

    // Calculate win probability using ELO formula
    const winProbability =
      1 / (1 + Math.pow(10, (opponentTeamRating - yourTeamRating) / 400));

    return {
      yourTeamRating: Math.round(yourTeamRating),
      opponentTeamRating: Math.round(opponentTeamRating),
      winProbability: Math.round(winProbability * 100),
    };
  };

  const stats = calculateWinProbability();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg">
            Challenge Players
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Match Type Selection */}
          <div>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleMatchTypeChange(MatchType.SINGLES)}
                className={`flex items-center justify-center gap-2 border px-4 py-2 transition-colors ${
                  matchType === MatchType.SINGLES
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                <User className="h-5 w-5" />
                <span className="font-medium">1v1 Singles</span>
              </button>
              <button
                onClick={() => handleMatchTypeChange(MatchType.DOUBLES)}
                className={`flex items-center justify-center gap-2 border px-4 py-2 transition-colors ${
                  matchType === MatchType.DOUBLES
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                <Users className="h-5 w-5" />
                <span className="font-medium">2v2 Doubles</span>
              </button>
            </div>
          </div>

          {/* Summary Section */}
          {!(selectedPartner || selectedOpponents.length > 0) && (
            <div
              className={cn(
                "border border-zinc-700 bg-zinc-800/50 flex items-center justify-center",
                {
                  "min-h-31.5": matchType === MatchType.DOUBLES,
                  "min-h-22.5": matchType === MatchType.SINGLES,
                },
              )}
            >
              Please select players for the match type above.
            </div>
          )}
          {(selectedPartner || selectedOpponents.length > 0) && (
            <div
              className={cn(
                "space-y-3 border border-zinc-700 bg-zinc-800/50 py-4 px-4",
                {
                  "min-h-31.5": matchType === MatchType.DOUBLES,
                  "min-h-22.5": matchType === MatchType.SINGLES,
                },
              )}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-zinc-300">
                  Match Setup
                </div>
                {stats && (
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-zinc-400">
                      Your Team:{" "}
                      <span className="font-semibold text-primary">
                        {stats.yourTeamRating}
                      </span>
                    </div>
                    <div className="text-zinc-400">
                      Opponents:{" "}
                      <span className="font-semibold text-red-400">
                        {stats.opponentTeamRating}
                      </span>
                    </div>
                    <div className="text-zinc-400">
                      Win Chance:{" "}
                      <span
                        className={`font-semibold ${stats.winProbability >= 50 ? "text-primary" : "text-red-400"}`}
                      >
                        {stats.winProbability}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {matchType === MatchType.DOUBLES && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 w-20">Your Team:</span>
                  <div className="flex items-center gap-2">
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "You"}
                        width={24}
                        height={24}
                        className="h-6 w-6 rounded-full"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-zinc-950">
                        {user?.name?.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm">You</span>
                    <span className="text-zinc-600">+</span>
                    {getPlayerById(selectedPartner) && (
                      <>
                        {getPlayerById(selectedPartner)?.image ? (
                          <Image
                            src={getPlayerById(selectedPartner)!.image!}
                            alt={getPlayerById(selectedPartner)!.name}
                            width={24}
                            height={24}
                            className="h-6 w-6 rounded-full"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-600 text-xs font-semibold">
                            {getPlayerById(selectedPartner)!.name.charAt(0)}
                          </div>
                        )}
                        <span className="text-sm">
                          {getPlayerById(selectedPartner)!.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 w-20">Opponents:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedOpponents.map((opponentId, index) => {
                    const opponent = getPlayerById(opponentId);
                    return opponent ? (
                      <div key={opponentId} className="flex items-center gap-2">
                        {index > 0 && <span className="text-zinc-600">+</span>}
                        {opponent.image ? (
                          <Image
                            src={opponent.image}
                            alt={opponent.name}
                            width={24}
                            height={24}
                            className="h-6 w-6 rounded-full"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-600 text-xs font-semibold">
                            {opponent.name.charAt(0)}
                          </div>
                        )}
                        <span className="text-sm">{opponent.name}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          <div>
            <Label className="text-zinc-400">Search Players</Label>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="mt-2 border-zinc-700 bg-zinc-800 text-white"
            />
          </div>

          {/* Players List */}
          <div>
            <Label className="text-zinc-400">
              {matchType === "SINGLES"
                ? "Select 1 Opponent"
                : "Select 1 Partner + 2 Opponents"}
            </Label>
            <div className="mt-2 max-h-64 overflow-y-auto border border-zinc-800 bg-zinc-800/50">
              {filteredPlayers.map((player) => {
                const isPartner = selectedPartner === player.id;
                const isOpponent = selectedOpponents.includes(player.id);
                const cannotBePartner = selectedOpponents.includes(player.id);
                const cannotBeOpponent = selectedPartner === player.id;
                const playerTier = getPlayerTier(player.rating);

                return (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 p-3 bg-zinc-900/50 hover:bg-zinc-800 transition-colors"
                  >
                    {player.image ? (
                      <Image
                        src={player.image}
                        alt={player.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-600 text-sm font-semibold">
                        {player.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{player.name}</div>
                        <Tooltip delayDuration={200}>
                          <TooltipTrigger asChild>
                            <span
                              className={`text-xs size-6 inline-flex items-center justify-center rounded-full cursor-help ${getTierBadgeClasses(playerTier)}`}
                            >
                              {playerTier.emoji}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{playerTier.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="text-xs text-zinc-400">
                        Rating: {player.rating}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {matchType === MatchType.DOUBLES && (
                        <Button
                          size="sm"
                          onClick={() => handleSelectPartner(player.id)}
                          disabled={cannotBePartner}
                          className={`text-xs relative ${
                            isPartner
                              ? "bg-primary text-zinc-950 hover:bg-primary/90"
                              : "bg-zinc-700 text-white hover:bg-zinc-600"
                          }`}
                        >
                          Partner
                          {isPartner && (
                            <Check className="h-3 w-3 absolute -top-1 -right-1 bg-primary rounded-full p-0.5" />
                          )}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleSelectOpponent(player.id)}
                        disabled={
                          cannotBeOpponent ||
                          (selectedOpponents.length >=
                            (matchType === MatchType.SINGLES ? 1 : 2) &&
                            !isOpponent)
                        }
                        className={`text-xs relative ${
                          isOpponent
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-zinc-700 text-white hover:bg-zinc-600"
                        }`}
                      >
                        Opponent
                        {isOpponent && (
                          <Check className="h-3 w-3 absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Message */}
          <div>
            <Label className="text-zinc-400">Message (Optional)</Label>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a challenge message..."
              className="mt-2 border-zinc-700 bg-zinc-800 text-white"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-zinc-700 text-zinc-400"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-primary text-zinc-950 hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Challenge"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
