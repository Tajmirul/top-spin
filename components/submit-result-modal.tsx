"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Users, User, Trophy, Check } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import Image from "next/image";
import { MatchType, UserRole } from "@prisma/client";
import { getPlayerTier, getTierBadgeClasses } from "@/lib/tiers";
import {
  submitMatchResult,
  SubmitMatchResultParams,
} from "@/app/actions/match-actions";
import { toast } from "sonner";
import { calculateELO, ELOResult } from "@/lib/elo";

interface Player {
  id: string;
  name: string;
  email: string;
  image: string | null;
  rating: number;
}

interface SubmitResultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubmitResultModal({ isOpen, onClose }: SubmitResultModalProps) {
  const { user } = useUser();
  const [matchType, setMatchType] = useState<MatchType>(MatchType.SINGLES);
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Check if user is admin
  const isAdmin = user?.role === UserRole.ADMIN;

  // Player selections
  const [selectedPartner, setSelectedPartner] = useState<string>("");
  const [selectedOpponents, setSelectedOpponents] = useState<string[]>([]);
  
  // Admin mode: select all players (not auto-including themselves)
  const [adminSelectedPlayers, setAdminSelectedPlayers] = useState<string[]>([]);

  // Match result
  const [matchesWon, setMatchesWon] = useState("");
  const [matchesLost, setMatchesLost] = useState("");

  const [loading, setLoading] = useState(false);

  const fetchPlayers = useCallback(async () => {
    try {
      const response = await fetch("/api/players");
      const data = await response.json();
      // If admin, show all players; otherwise exclude current user
      if (isAdmin) {
        setPlayers(data.players);
      } else {
        setPlayers(data.players.filter((p: Player) => p.id !== user!.id));
      }
    } catch (error) {
      console.error("Failed to fetch players:", error);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (isOpen) {
      fetchPlayers();
    }
  }, [isOpen, fetchPlayers]);

  const filteredPlayers = players.filter(
    (player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async () => {
    // Validation for admin mode
    if (isAdmin) {
      if (matchType === MatchType.SINGLES && adminSelectedPlayers.length !== 2) {
        toast.error("Please select exactly 2 players for singles");
        return;
      }
      if (matchType === MatchType.DOUBLES && adminSelectedPlayers.length !== 4) {
        toast.error("Please select exactly 4 players for doubles");
        return;
      }
    } else {
      // Validation for regular users
      if (matchType === MatchType.SINGLES && selectedOpponents.length === 0) {
        toast.error("Please select an opponent");
        return;
      }

      if (
        matchType === MatchType.DOUBLES &&
        (selectedOpponents.length !== 2 || !selectedPartner)
      ) {
        toast.error("Please select 1 partner and 2 opponents for doubles");
        return;
      }
    }

    if (!matchesWon || !matchesLost) {
      toast.error("Please enter matches won and lost");
      return;
    }

    const won = parseInt(matchesWon);
    const lost = parseInt(matchesLost);

    if (isNaN(won) || isNaN(lost) || won < 0 || lost < 0) {
      toast.error("Please enter valid numbers");
      return;
    }

    if (won === 0 && lost === 0) {
      toast.error("At least one match must be played");
      return;
    }

    setLoading(true);
    try {
      const payload: SubmitMatchResultParams = {
        matchType,
        matchesWon: won,
        matchesLost: lost,
      };

      if (isAdmin) {
        // Admin mode: use selected players
        if (matchType === MatchType.SINGLES) {
          payload.player1Id = adminSelectedPlayers[0];
          payload.player2Id = adminSelectedPlayers[1];
        } else {
          // For doubles, first 2 are team 1 (winners), last 2 are team 2 (losers)
          payload.team1Player1Id = adminSelectedPlayers[0];
          payload.team1Player2Id = adminSelectedPlayers[1];
          payload.team2Player1Id = adminSelectedPlayers[2];
          payload.team2Player2Id = adminSelectedPlayers[3];
        }
      } else {
        // Regular user mode
        if (matchType === MatchType.SINGLES) {
          // Singles match - you vs opponent
          payload.player1Id = user!.id;
          payload.player2Id = selectedOpponents[0];
        } else {
          // Doubles match - your team vs opponent team
          payload.team1Player1Id = user!.id;
          payload.team1Player2Id = selectedPartner;
          payload.team2Player1Id = selectedOpponents[0];
          payload.team2Player2Id = selectedOpponents[1];
        }
      }

      const result = await submitMatchResult(payload);

      if (result.success) {
        toast.success(
          `Match results submitted (${won} wins, ${lost} losses)! Waiting for opponent confirmation.`,
        );
        onClose();
        resetForm();
      } else {
        toast.error(result.error || "Failed to submit result");
      }
    } catch (error) {
      console.error("Failed to submit result:", error);
      toast.error("Failed to submit result");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMatchType(MatchType.SINGLES);
    setSelectedOpponents([]);
    setSelectedPartner("");
    setAdminSelectedPlayers([]);
    setMatchesWon("");
    setMatchesLost("");
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
    setAdminSelectedPlayers([]);
  };

  const getPlayerById = (id: string) => players.find((p) => p.id === id);

  const calculateMatchStats = () => {
    if (isAdmin) {
      // Admin mode: need correct number of players selected
      const requiredPlayers = matchType === MatchType.SINGLES ? 2 : 4;
      if (adminSelectedPlayers.length !== requiredPlayers) return null;
    } else {
      // Regular user mode
      if (selectedOpponents.length === 0 || !user) return null;
    }

    const won = parseInt(matchesWon) || 0;
    const lost = parseInt(matchesLost) || 0;

    let yourTeamRating: number;
    let opponentTeamRating: number;
    let eloChanges: ELOResult | null = null;

    // Determine overall winner (who won more matches)
    const youWonOverall = won > lost;

    if (matchType === MatchType.SINGLES) {
      if (isAdmin) {
        const player1 = getPlayerById(adminSelectedPlayers[0]);
        const player2 = getPlayerById(adminSelectedPlayers[1]);
        if (!player1 || !player2) return null;
        yourTeamRating = player1.rating;
        opponentTeamRating = player2.rating;
      } else {
        yourTeamRating = user!.rating;
        const opponent = getPlayerById(selectedOpponents[0]);
        if (!opponent) return null;
        opponentTeamRating = opponent.rating;
      }

      if (won > 0 || lost > 0) {
        if (isAdmin) {
          const player1 = getPlayerById(adminSelectedPlayers[0]);
          const player2 = getPlayerById(adminSelectedPlayers[1]);
          if (!player1 || !player2) return null;
          
          if (youWonOverall) {
            eloChanges = calculateELO({
              winner1Rating: player1.rating,
              winner2Rating: undefined,
              loser1Rating: player2.rating,
              loser2Rating: undefined,
              matchesWon: won,
              matchesLost: lost,
            });
          } else {
            eloChanges = calculateELO({
              winner1Rating: player2.rating,
              winner2Rating: undefined,
              loser1Rating: player1.rating,
              loser2Rating: undefined,
              matchesWon: lost,
              matchesLost: won,
            });
          }
        } else {
          const opponent = getPlayerById(selectedOpponents[0]);
          if (!opponent) return null;
          
          // Pass overall winner as winner1, overall loser as loser1
          if (youWonOverall) {
            eloChanges = calculateELO({
              winner1Rating: user!.rating,
              winner2Rating: undefined,
              loser1Rating: opponent.rating,
              loser2Rating: undefined,
              matchesWon: won,
              matchesLost: lost,
            });
          } else {
            // Opponent won overall, so they're the winner
            eloChanges = calculateELO({
              winner1Rating: opponent.rating,
              winner2Rating: undefined,
              loser1Rating: user!.rating,
              loser2Rating: undefined,
              matchesWon: lost,
              matchesLost: won,
            });
          }
        }
      }
    } else {
      // Doubles
      if (isAdmin) {
        const player1 = getPlayerById(adminSelectedPlayers[0]);
        const player2 = getPlayerById(adminSelectedPlayers[1]);
        const player3 = getPlayerById(adminSelectedPlayers[2]);
        const player4 = getPlayerById(adminSelectedPlayers[3]);
        if (!player1 || !player2 || !player3 || !player4) return null;

        yourTeamRating = (player1.rating + player2.rating) / 2;
        opponentTeamRating = (player3.rating + player4.rating) / 2;
      } else {
        const partner = getPlayerById(selectedPartner);
        if (!partner || selectedOpponents.length !== 2) return null;

        yourTeamRating = (user!.rating + partner.rating) / 2;

        const opponent1 = getPlayerById(selectedOpponents[0]);
        const opponent2 = getPlayerById(selectedOpponents[1]);
        if (!opponent1 || !opponent2) return null;

        opponentTeamRating = (opponent1.rating + opponent2.rating) / 2;
      }

      if (won > 0 || lost > 0) {
        if (isAdmin) {
          const player1 = getPlayerById(adminSelectedPlayers[0]);
          const player2 = getPlayerById(adminSelectedPlayers[1]);
          const player3 = getPlayerById(adminSelectedPlayers[2]);
          const player4 = getPlayerById(adminSelectedPlayers[3]);
          if (!player1 || !player2 || !player3 || !player4) return null;

          if (youWonOverall) {
            eloChanges = calculateELO({
              winner1Rating: player1.rating,
              winner2Rating: player2.rating,
              loser1Rating: player3.rating,
              loser2Rating: player4.rating,
              matchesWon: won,
              matchesLost: lost,
            });
          } else {
            eloChanges = calculateELO({
              winner1Rating: player3.rating,
              winner2Rating: player4.rating,
              loser1Rating: player1.rating,
              loser2Rating: player2.rating,
              matchesWon: lost,
              matchesLost: won,
            });
          }
        } else {
          const partner = getPlayerById(selectedPartner);
          const opponent1 = getPlayerById(selectedOpponents[0]);
          const opponent2 = getPlayerById(selectedOpponents[1]);
          if (!partner || !opponent1 || !opponent2) return null;

          // Pass overall winner team as winner1/winner2, overall loser team as loser1/loser2
          if (youWonOverall) {
            eloChanges = calculateELO({
              winner1Rating: user!.rating,
              winner2Rating: partner.rating,
              loser1Rating: opponent1.rating,
              loser2Rating: opponent2.rating,
              matchesWon: won,
              matchesLost: lost,
            });
          } else {
            // Opponent team won overall, so they're the winners
            eloChanges = calculateELO({
              winner1Rating: opponent1.rating,
              winner2Rating: opponent2.rating,
              loser1Rating: user!.rating,
              loser2Rating: partner.rating,
              matchesWon: lost,
              matchesLost: won,
            });
          }
        }
      }
    }

    // Calculate win probability using ELO formula
    const winProbability =
      1 / (1 + Math.pow(10, (opponentTeamRating - yourTeamRating) / 400));

    return {
      yourTeamRating: Math.round(yourTeamRating),
      opponentTeamRating: Math.round(opponentTeamRating),
      winProbability: Math.round(winProbability * 100),
      eloChanges,
      youWonOverall, // Include this so display logic knows who won
    };
  };

  const stats = calculateMatchStats();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Submit Match Result
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Match Type Selection */}
          <div>
            <Label className="text-zinc-400">Match Type</Label>
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

          {/* Match Results */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-400">
                {isAdmin 
                  ? matchType === MatchType.SINGLES 
                    ? "Player 1 Wins" 
                    : "Team 1 Wins"
                  : "Matches You Won"}
              </Label>
              <Input
                type="number"
                min="0"
                value={matchesWon}
                onChange={(e) => setMatchesWon(e.target.value)}
                placeholder="3"
                className="mt-2 border-zinc-700 bg-zinc-800 text-white"
              />
            </div>
            <div>
              <Label className="text-zinc-400">
                {isAdmin 
                  ? matchType === MatchType.SINGLES 
                    ? "Player 2 Wins" 
                    : "Team 2 Wins"
                  : "Matches You Lost"}
              </Label>
              <Input
                type="number"
                min="0"
                value={matchesLost}
                onChange={(e) => setMatchesLost(e.target.value)}
                placeholder="2"
                className="mt-2 border-zinc-700 bg-zinc-800 text-white"
              />
            </div>
          </div>

          {/* Match Setup Summary */}
          {((isAdmin && adminSelectedPlayers.length > 0) || selectedPartner || selectedOpponents.length > 0) && (
            <div className="space-y-3 border border-zinc-700 bg-zinc-800/50 py-4 px-4">
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
                  <span className="text-xs text-zinc-500 w-20">{isAdmin ? "Team 1:" : "Your Team:"}</span>
                  <div className="flex items-center gap-2">
                    {isAdmin ? (
                      // Admin mode: show first 2 selected players
                      adminSelectedPlayers.slice(0, 2).map((playerId, index) => {
                        const player = getPlayerById(playerId);
                        if (!player) return null;
                        return (
                          <div key={playerId} className="flex items-center gap-2">
                            {index > 0 && <span className="text-zinc-600">+</span>}
                            {player.image ? (
                              <Image
                                src={player.image}
                                alt={player.name}
                                width={24}
                                height={24}
                                className="h-6 w-6 rounded-full"
                              />
                            ) : (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-600 text-xs font-semibold">
                                {player.name.charAt(0)}
                              </div>
                            )}
                            <span className="text-sm">{player.name}</span>
                          </div>
                        );
                      })
                    ) : (
                      // Regular user mode
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 w-20">{isAdmin && matchType === MatchType.DOUBLES ? "Team 2:" : "Opponents:"}</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {isAdmin ? (
                    // Admin mode: show remaining selected players (opponent in singles, team 2 in doubles)
                    adminSelectedPlayers.slice(matchType === MatchType.SINGLES ? 1 : 2).map((playerId, index) => {
                      const player = getPlayerById(playerId);
                      if (!player) return null;
                      return (
                        <div key={playerId} className="flex items-center gap-2">
                          {index > 0 && <span className="text-zinc-600">+</span>}
                          {player.image ? (
                            <Image
                              src={player.image}
                              alt={player.name}
                              width={24}
                              height={24}
                              className="h-6 w-6 rounded-full"
                            />
                          ) : (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-600 text-xs font-semibold">
                              {player.name.charAt(0)}
                            </div>
                          )}
                          <span className="text-sm">{player.name}</span>
                        </div>
                      );
                    })
                  ) : (
                    // Regular user mode
                    selectedOpponents.map((opponentId, index) => {
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
                    })
                  )}
                </div>
              </div>

              {/* ELO Changes Preview */}
              {stats?.eloChanges && (matchesWon || matchesLost) && (
                <div className="pt-2 border-t border-zinc-700">
                  <div className="text-xs font-medium text-zinc-400 mb-2">
                    Expected Rating Changes (
                    {isAdmin 
                      ? matchType === MatchType.SINGLES
                        ? `Player 1: ${matchesWon} wins, Player 2: ${matchesLost} wins`
                        : `Team 1: ${matchesWon} wins, Team 2: ${matchesLost} wins`
                      : `${matchesWon} wins, ${matchesLost} losses`
                    }):
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    {matchType === MatchType.SINGLES ? (
                      <>
                        {isAdmin ? (
                          // Admin mode: show both selected players
                          <>
                            <div className="text-zinc-300">
                              {getPlayerById(adminSelectedPlayers[0])?.name}:{" "}
                              {getPlayerById(adminSelectedPlayers[0])?.rating} →{" "}
                              <span
                                className={`font-semibold ${
                                  stats.youWonOverall
                                    ? "text-primary"
                                    : "text-red-400"
                                }`}
                              >
                                {stats.youWonOverall
                                  ? stats.eloChanges.winner1NewRating
                                  : stats.eloChanges.loser1NewRating}
                              </span>
                              <span
                                className={`ml-1 ${
                                  stats.youWonOverall
                                    ? "text-primary"
                                    : "text-red-400"
                                }`}
                              >
                                (
                                {stats.youWonOverall
                                  ? stats.eloChanges.winner1Change > 0
                                    ? "+"
                                    : ""
                                  : stats.eloChanges.loser1Change > 0
                                    ? "+"
                                    : ""}
                                {stats.youWonOverall
                                  ? stats.eloChanges.winner1Change
                                  : stats.eloChanges.loser1Change}
                                )
                              </span>
                            </div>
                            <div className="text-zinc-300">
                              {getPlayerById(adminSelectedPlayers[1])?.name}:{" "}
                              {getPlayerById(adminSelectedPlayers[1])?.rating} →{" "}
                              <span
                                className={`font-semibold ${
                                  stats.youWonOverall
                                    ? "text-red-400"
                                    : "text-primary"
                                }`}
                              >
                                {stats.youWonOverall
                                  ? stats.eloChanges.loser1NewRating
                                  : stats.eloChanges.winner1NewRating}
                              </span>
                              <span
                                className={`ml-1 ${
                                  stats.youWonOverall
                                    ? "text-red-400"
                                    : "text-primary"
                                }`}
                              >
                                (
                                {stats.youWonOverall
                                  ? stats.eloChanges.loser1Change > 0
                                    ? "+"
                                    : ""
                                  : stats.eloChanges.winner1Change > 0
                                    ? "+"
                                    : ""}
                                {stats.youWonOverall
                                  ? stats.eloChanges.loser1Change
                                  : stats.eloChanges.winner1Change}
                                )
                              </span>
                            </div>
                          </>
                        ) : (
                          // Regular user mode
                          <>
                            <div className="text-zinc-300">
                              You: {user?.rating} →{" "}
                              <span
                                className={`font-semibold ${
                                  stats.youWonOverall
                                    ? "text-primary"
                                    : "text-red-400"
                                }`}
                              >
                                {stats.youWonOverall
                                  ? stats.eloChanges.winner1NewRating
                                  : stats.eloChanges.loser1NewRating}
                              </span>
                              <span
                                className={`ml-1 ${
                                  stats.youWonOverall
                                    ? "text-primary"
                                    : "text-red-400"
                                }`}
                              >
                                (
                                {stats.youWonOverall
                                  ? stats.eloChanges.winner1Change > 0
                                    ? "+"
                                    : ""
                                  : stats.eloChanges.loser1Change > 0
                                    ? "+"
                                    : ""}
                                {stats.youWonOverall
                                  ? stats.eloChanges.winner1Change
                                  : stats.eloChanges.loser1Change}
                                )
                              </span>
                            </div>
                            <div className="text-zinc-300">
                              Opponent:{" "}
                              {getPlayerById(selectedOpponents[0])?.rating} →{" "}
                              <span
                                className={`font-semibold ${
                                  stats.youWonOverall
                                    ? "text-red-400"
                                    : "text-primary"
                                }`}
                              >
                                {stats.youWonOverall
                                  ? stats.eloChanges.loser1NewRating
                                  : stats.eloChanges.winner1NewRating}
                              </span>
                              <span
                                className={`ml-1 ${
                                  stats.youWonOverall
                                    ? "text-red-400"
                                    : "text-primary"
                                }`}
                              >
                                (
                                {stats.youWonOverall
                                  ? stats.eloChanges.loser1Change > 0
                                    ? "+"
                                    : ""
                                  : stats.eloChanges.winner1Change > 0
                                    ? "+"
                                    : ""}
                                {stats.youWonOverall
                                  ? stats.eloChanges.loser1Change
                                  : stats.eloChanges.winner1Change}
                                )
                              </span>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="text-zinc-300">
                          Your Team: {Math.round(stats.yourTeamRating)} →{" "}
                          <span
                            className={`font-semibold ${
                              stats.youWonOverall
                                ? "text-primary"
                                : "text-red-400"
                            }`}
                          >
                            {stats.youWonOverall
                              ? Math.round(
                                  (stats.eloChanges.winner1NewRating +
                                    (stats.eloChanges.winner2NewRating || 0)) /
                                    2,
                                )
                              : Math.round(
                                  (stats.eloChanges.loser1NewRating +
                                    (stats.eloChanges.loser2NewRating || 0)) /
                                    2,
                                )}
                          </span>
                          <span
                            className={`ml-1 text-xs ${
                              stats.youWonOverall
                                ? "text-primary"
                                : "text-red-400"
                            }`}
                          >
                            (
                            {stats.youWonOverall
                              ? stats.eloChanges.winner1Change > 0
                                ? "+"
                                : ""
                              : stats.eloChanges.loser1Change > 0
                                ? "+"
                                : ""}
                            {stats.youWonOverall
                              ? stats.eloChanges.winner1Change
                              : stats.eloChanges.loser1Change}
                            )
                          </span>
                        </div>
                        <div className="text-zinc-300">
                          Opponent Team: {Math.round(stats.opponentTeamRating)}{" "}
                          →{" "}
                          <span
                            className={`font-semibold ${
                              stats.youWonOverall
                                ? "text-red-400"
                                : "text-primary"
                            }`}
                          >
                            {stats.youWonOverall
                              ? Math.round(
                                  (stats.eloChanges.loser1NewRating +
                                    (stats.eloChanges.loser2NewRating || 0)) /
                                    2,
                                )
                              : Math.round(
                                  (stats.eloChanges.winner1NewRating +
                                    (stats.eloChanges.winner2NewRating || 0)) /
                                    2,
                                )}
                          </span>
                          <span
                            className={`ml-1 text-xs ${
                              stats.youWonOverall
                                ? "text-red-400"
                                : "text-primary"
                            }`}
                          >
                            (
                            {stats.youWonOverall
                              ? stats.eloChanges.loser1Change > 0
                                ? "+"
                                : ""
                              : stats.eloChanges.winner1Change > 0
                                ? "+"
                                : ""}
                            {stats.youWonOverall
                              ? stats.eloChanges.loser1Change
                              : stats.eloChanges.winner1Change}
                            )
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
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
              {isAdmin
                ? matchType === "SINGLES"
                  ? "Select 2 Players (first wins, second loses)"
                  : "Select 4 Players (first 2 are Team 1/winners, last 2 are Team 2/losers)"
                : matchType === "SINGLES"
                  ? "Select 1 Opponent"
                  : "Select 1 Partner + 2 Opponents"}
            </Label>
            {isAdmin && (
              <div className="text-xs text-zinc-500 mt-1">
                Note: Select players in order based on who won more matches. Enter their win counts above.
              </div>
            )}
            <div className="mt-2 max-h-64 overflow-y-auto border border-zinc-800 bg-zinc-800/50">
              {filteredPlayers.map((player) => {
                const isAdminSelected = adminSelectedPlayers.includes(player.id);
                const adminSelectionIndex = adminSelectedPlayers.indexOf(player.id);
                const isPartner = selectedPartner === player.id;
                const isOpponent = selectedOpponents.includes(player.id);
                const cannotBePartner = selectedOpponents.includes(player.id);
                const cannotBeOpponent = selectedPartner === player.id;
                const playerTier = getPlayerTier(player.rating);

                return (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 p-3 border-b border-zinc-800 hover:bg-zinc-800 transition-colors"
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
                      {isAdmin ? (
                        // Admin mode: single "Select" button with order number
                        <Button
                          size="sm"
                          onClick={() => {
                            if (isAdminSelected) {
                              setAdminSelectedPlayers(adminSelectedPlayers.filter(id => id !== player.id));
                            } else {
                              const maxPlayers = matchType === MatchType.SINGLES ? 2 : 4;
                              if (adminSelectedPlayers.length < maxPlayers) {
                                setAdminSelectedPlayers([...adminSelectedPlayers, player.id]);
                              }
                            }
                          }}
                          disabled={
                            !isAdminSelected &&
                            adminSelectedPlayers.length >= (matchType === MatchType.SINGLES ? 2 : 4)
                          }
                          className={`text-xs relative ${
                            isAdminSelected
                              ? "bg-primary text-zinc-950 hover:bg-primary/90"
                              : "bg-zinc-700 text-white hover:bg-zinc-600"
                          }`}
                        >
                          {isAdminSelected ? `Selected #${adminSelectionIndex + 1}` : "Select"}
                          {isAdminSelected && (
                            <Check className="h-3 w-3 absolute -top-1 -right-1 bg-primary rounded-full p-0.5" />
                          )}
                        </Button>
                      ) : (
                        // Regular user mode: Partner and Opponent buttons
                        <>
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
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
              {loading ? "Submitting..." : "Submit Result"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
