/**
 * ELO Rating Calculation
 *
 * Formula: New Rating = Old Rating + K × (Actual Score - Expected Win Probability)
 *
 * Expected Win Probability = 1 / (1 + 10^((Opponent Rating - Your Rating) / 400))
 *
 * - K-Factor: 32 (how much ratings change per match)
 * - Actual Score: 1 for win, 0 for loss
 * - Expected Win Probability: 0.0 to 1.0 (your probability of winning based on rating difference)
 * - For 2v2: Uses team average rating, distributes change equally to both players
 *
 * Supports both 1v1 (Singles) and 2v2 (Doubles) matches
 */

export interface ELOResult {
  winner1NewRating: number;
  loser1NewRating: number;
  winner1Change: number;
  loser1Change: number;
  winner2NewRating?: number;
  loser2NewRating?: number;
  winner2Change?: number;
  loser2Change?: number;
}

interface ELOCalculationParams {
  winner1Rating: number;
  loser1Rating: number;
  winner2Rating?: number;
  loser2Rating?: number;
  matchesWon?: number;
  matchesLost?: number;
  kFactor?: number;
}

/**
 * Calculate ELO for both Singles (1v1) and Doubles (2v2) match series
 * For Singles: Only provide winner1Rating and loser1Rating
 * For Doubles: Provide all four ratings (winner1, winner2, loser1, loser2)
 * Supports multiple matches won/lost in a series
 * K-Factor can be customized, defaults to 32
 * Returns new ratings and rating changes for each player
 */
export function calculateELO({
  winner1Rating,
  loser1Rating,
  winner2Rating,
  loser2Rating,
  matchesWon = 1,
  matchesLost = 0,
  kFactor = Number(process.env.K_FACTOR || "32"),
}: ELOCalculationParams): ELOResult {
  const isDoubles = winner2Rating !== undefined && loser2Rating !== undefined;

  if (isDoubles) {
    // Doubles calculation
    let currentWinner1Rating = winner1Rating;
    let currentWinner2Rating = winner2Rating;
    let currentLoser1Rating = loser1Rating;
    let currentLoser2Rating = loser2Rating;
    let totalWinner1Change = 0;
    let totalWinner2Change = 0;
    let totalLoser1Change = 0;
    let totalLoser2Change = 0;

    // Calculate ELO for each match won by winning team
    for (let i = 0; i < matchesWon; i++) {
      const winningTeamAvg = (currentWinner1Rating + currentWinner2Rating) / 2;
      const losingTeamAvg = (currentLoser1Rating + currentLoser2Rating) / 2;

      const expectedWinningTeam =
        1 / (1 + Math.pow(10, (losingTeamAvg - winningTeamAvg) / 400));
      const expectedLosingTeam =
        1 / (1 + Math.pow(10, (winningTeamAvg - losingTeamAvg) / 400));

      const winningTeamChange = Math.round(kFactor * (1 - expectedWinningTeam));
      const losingTeamChange = Math.round(kFactor * (0 - expectedLosingTeam));

      currentWinner1Rating += winningTeamChange;
      currentWinner2Rating += winningTeamChange;
      currentLoser1Rating += losingTeamChange;
      currentLoser2Rating += losingTeamChange;
      totalWinner1Change += winningTeamChange;
      totalWinner2Change += winningTeamChange;
      totalLoser1Change += losingTeamChange;
      totalLoser2Change += losingTeamChange;
    }

    // Calculate ELO for each match lost by winning team (won by losing team)
    for (let i = 0; i < matchesLost; i++) {
      const winningTeamAvg = (currentWinner1Rating + currentWinner2Rating) / 2;
      const losingTeamAvg = (currentLoser1Rating + currentLoser2Rating) / 2;

      const expectedWinningTeam =
        1 / (1 + Math.pow(10, (losingTeamAvg - winningTeamAvg) / 400));
      const expectedLosingTeam =
        1 / (1 + Math.pow(10, (winningTeamAvg - losingTeamAvg) / 400));

      const winningTeamChange = Math.round(kFactor * (0 - expectedWinningTeam));
      const losingTeamChange = Math.round(kFactor * (1 - expectedLosingTeam));

      currentWinner1Rating += winningTeamChange;
      currentWinner2Rating += winningTeamChange;
      currentLoser1Rating += losingTeamChange;
      currentLoser2Rating += losingTeamChange;
      totalWinner1Change += winningTeamChange;
      totalWinner2Change += winningTeamChange;
      totalLoser1Change += losingTeamChange;
      totalLoser2Change += losingTeamChange;
    }

    return {
      winner1NewRating: currentWinner1Rating,
      winner2NewRating: currentWinner2Rating,
      loser1NewRating: currentLoser1Rating,
      loser2NewRating: currentLoser2Rating,
      winner1Change: totalWinner1Change,
      winner2Change: totalWinner2Change,
      loser1Change: totalLoser1Change,
      loser2Change: totalLoser2Change,
    };
  } else {
    // Singles calculation
    let currentWinner1Rating = winner1Rating;
    let currentLoser1Rating = loser1Rating;
    let totalWinner1Change = 0;
    let totalLoser1Change = 0;

    // Calculate ELO for each match won by winner
    for (let i = 0; i < matchesWon; i++) {
      const expectedWinner =
        1 /
        (1 + Math.pow(10, (currentLoser1Rating - currentWinner1Rating) / 400));
      const expectedLoser =
        1 /
        (1 + Math.pow(10, (currentWinner1Rating - currentLoser1Rating) / 400));

      const winner1Change = Math.round(kFactor * (1 - expectedWinner));
      const loser1Change = Math.round(kFactor * (0 - expectedLoser));

      currentWinner1Rating += winner1Change;
      currentLoser1Rating += loser1Change;
      totalWinner1Change += winner1Change;
      totalLoser1Change += loser1Change;
    }

    // Calculate ELO for each match lost by winner (won by loser)
    for (let i = 0; i < matchesLost; i++) {
      const expectedWinner =
        1 /
        (1 + Math.pow(10, (currentLoser1Rating - currentWinner1Rating) / 400));
      const expectedLoser =
        1 /
        (1 + Math.pow(10, (currentWinner1Rating - currentLoser1Rating) / 400));

      const winner1Change = Math.round(kFactor * (0 - expectedWinner));
      const loser1Change = Math.round(kFactor * (1 - expectedLoser));

      currentWinner1Rating += winner1Change;
      currentLoser1Rating += loser1Change;
      totalWinner1Change += winner1Change;
      totalLoser1Change += loser1Change;
    }

    return {
      winner1NewRating: currentWinner1Rating,
      loser1NewRating: currentLoser1Rating,
      winner1Change: totalWinner1Change,
      loser1Change: totalLoser1Change,
    };
  }
}
