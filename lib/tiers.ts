/**
 * Player Tiers based on ELO Rating
 * 
 * Provides fun, thematic tier names and colors for different rating ranges.
 * Tiers help visualize player skill levels and progression.
 */

export const PLAYER_TIERS = {
  PADDLE_PICKER: { 
    min: 0, 
    max: 1299, 
    label: "Paddle Picker", 
    color: "zinc",
    emoji: "🏓"
  },
  BALL_BOUNCER: { 
    min: 1300, 
    max: 1499, 
    label: "Ball Bouncer", 
    color: "blue",
    emoji: "🎯"
  },
  SPIN_MASTER: { 
    min: 1500, 
    max: 1699, 
    label: "Spin Master", 
    color: "green",
    emoji: "⚡"
  },
  RALLY_CHAMPION: { 
    min: 1700, 
    max: 1899, 
    label: "Rally Champion", 
    color: "yellow",
    emoji: "🔥"
  },
  TABLE_LEGEND: { 
    min: 1900, 
    max: 2099, 
    label: "Table Legend", 
    color: "orange",
    emoji: "💫"
  },
  PING_PONG_KING: { 
    min: 2100, 
    max: 2299, 
    label: "Ping Pong King", 
    color: "red",
    emoji: "👑"
  },
  TABLE_TENNIS_GOD: { 
    min: 2300, 
    max: Infinity, 
    label: "Table Tennis God", 
    color: "primary",
    emoji: "🏆"
  },
} as const;

export type PlayerTier = typeof PLAYER_TIERS[keyof typeof PLAYER_TIERS];
export type TierKey = keyof typeof PLAYER_TIERS;

/**
 * Get the tier for a given rating
 */
export function getPlayerTier(rating: number): PlayerTier & { key: TierKey } {
  for (const [key, tier] of Object.entries(PLAYER_TIERS) as [TierKey, PlayerTier][]) {
    if (rating >= tier.min && rating <= tier.max) {
      return { ...tier, key };
    }
  }
  return { ...PLAYER_TIERS.PADDLE_PICKER, key: "PADDLE_PICKER" };
}

/**
 * Get Tailwind classes for tier badge
 */
export function getTierBadgeClasses(tier: PlayerTier): string {
  const colorMap: Record<string, string> = {
    zinc: "bg-zinc-700 text-zinc-300",
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
    orange: "bg-orange-500/20 text-orange-400",
    red: "bg-red-500/20 text-red-400",
    primary: "bg-primary/20 text-primary",
  };
  
  return colorMap[tier.color] || colorMap.zinc;
}

/**
 * Get points needed to reach next tier
 */
export function getPointsToNextTier(rating: number): number | null {
  const currentTier = getPlayerTier(rating);
  
  if (currentTier.max === Infinity) {
    return null; // Already at max tier
  }
  
  return currentTier.max - rating + 1;
}
