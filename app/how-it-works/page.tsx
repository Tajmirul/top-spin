import { PLAYER_TIERS, getTierBadgeClasses } from "@/lib/tiers"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <Link 
            href="/dashboard" 
            className="text-sm text-zinc-400 hover:text-primary transition-colors mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
            How It Works
          </h1>
          <p className="text-lg text-zinc-400">
            Everything you need to know about TopSpin&apos;s ranking system, tiers, and match rules.
          </p>
        </div>

        {/* ELO Rating System */}
        <section id="elo" className="mb-12 scroll-mt-8">
          <h2 className="font-serif text-3xl font-bold text-white mb-6">
            ⚡ ELO Rating System
          </h2>
          
          <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">What is ELO?</h3>
            <p className="text-zinc-300 mb-4">
              We use the <strong className="text-primary">ELO rating system</strong> - the same system used in chess - to calculate fair and accurate player rankings. Your rating changes after each match based on the result and your opponent&apos;s strength.
            </p>
            <div className="bg-zinc-950 border border-zinc-800 p-4 mb-4">
              <div className="font-mono text-sm text-zinc-300 mb-3">
                New Rating = Old Rating + K × (Actual - Expected)
              </div>
              <div className="text-xs space-y-1 text-zinc-400 border-t border-zinc-800 pt-3">
                <div><strong className="text-zinc-300">Actual:</strong> Match result (1 for win, 0 for loss)</div>
                <div><strong className="text-zinc-300">Expected:</strong> Win probability based on rating difference (0.0 to 1.0)</div>
                <div><strong className="text-zinc-300">K:</strong> Rating change multiplier (32 points)</div>
              </div>
            </div>
            <p className="text-sm text-zinc-400">
              <strong>Example:</strong> If you have a 60% win chance (Expected = 0.6) and you win (Actual = 1), you gain 32 × (1 - 0.6) = <strong className="text-primary">+13 points</strong>. If you lose (Actual = 0), you lose 32 × (0 - 0.6) = <strong className="text-red-400">-19 points</strong>.
            </p>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Starting Rating</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-bold text-primary">1500</span>
              <span className="text-zinc-400">points</span>
            </div>
            <p className="text-zinc-300">
              Everyone starts at <strong>1500 rating points</strong> - representing an average, unproven skill level. This gives you room to both rise and fall based on your performance.
            </p>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">How Ratings Change</h3>
            <ul className="space-y-3 text-zinc-300">
              <li className="flex gap-3">
                <span className="text-primary text-lg">✓</span>
                <span><strong>Win:</strong> You gain rating points (amount depends on opponent&apos;s rating)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 text-lg">✗</span>
                <span><strong>Loss:</strong> You lose rating points</span>
              </li>
              <li className="flex gap-3">
                <span className="text-yellow-500 text-lg">⚡</span>
                <span><strong>Upset Win:</strong> Beat a higher-rated player → gain MORE points</span>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-500 text-lg">⚠</span>
                <span><strong>Upset Loss:</strong> Lose to lower-rated player → lose MORE points</span>
              </li>
            </ul>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Singles vs Doubles</h3>
            <div className="space-y-4 text-zinc-300">
              <div>
                <div className="text-primary font-semibold mb-2">Singles (1v1):</div>
                <p>Direct comparison of two player ratings. Winner gains points, loser loses the same amount.</p>
              </div>
              <div>
                <div className="text-primary font-semibold mb-2">Doubles (2v2):</div>
                <p>Uses <strong>team average rating</strong> for calculation. Both teammates receive the same rating change - encouraging balanced team formation.</p>
              </div>
            </div>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Win Probability</h3>
            <p className="text-zinc-300 mb-4">
              Before every match, we calculate your probability of winning based on rating differences:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Same Rating (0 diff)</span>
                <span className="text-white font-semibold">50%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">+100 points ahead</span>
                <span className="text-green-400 font-semibold">64%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">+200 points ahead</span>
                <span className="text-green-400 font-semibold">76%</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-400">+400 points ahead</span>
                <span className="text-green-400 font-semibold">91%</span>
              </div>
            </div>
          </Card>
        </section>

        {/* Player Tiers */}
        <section id="tiers" className="mb-12 scroll-mt-8">
          <h2 className="font-serif text-3xl font-bold text-white mb-6">
            🏆 Player Tiers
          </h2>
          
          <p className="text-zinc-400 mb-6">
            Your rating determines your tier - a fun way to visualize your skill level and track progression.
          </p>

          <div className="space-y-3">
            {Object.entries(PLAYER_TIERS).reverse().map(([key, tier]) => (
              <Card key={key} className="bg-zinc-900 border-zinc-800 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{tier.emoji}</span>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">
                          {tier.label}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTierBadgeClasses(tier)}`}>
                          {tier.min === 0 ? `< ${tier.max + 1}` : 
                           tier.max === Infinity ? `${tier.min}+` :
                           `${tier.min} - ${tier.max}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Match Rules */}
        <section id="rules" className="mb-12 scroll-mt-8">
          <h2 className="font-serif text-3xl font-bold text-white mb-6">
            📋 Match Rules
          </h2>

          <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">1. Challenge Opponents</h3>
            <p className="text-zinc-300 mb-3">
              Click the <strong className="text-primary">&quot;Challenge&quot;</strong> button to start a match. Choose:
            </p>
            <ul className="space-y-2 text-zinc-300 ml-4">
              <li>• <strong>Singles (1v1):</strong> Challenge one opponent</li>
              <li>• <strong>Doubles (2v2):</strong> Choose your partner and two opponents</li>
            </ul>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">2. Accept Challenge</h3>
            <p className="text-zinc-300">
              Challenged players receive a notification. They can <strong className="text-green-400">accept</strong> or <strong className="text-red-400">decline</strong> the challenge.
            </p>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">3. Play & Log Result</h3>
            <p className="text-zinc-300 mb-3">
              After playing, the winner logs the match result with the final score.
            </p>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-400">
              Example: &quot;11-9, 11-7&quot; or just final set scores
            </div>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">4. Confirmation System</h3>
            <p className="text-zinc-300 mb-4">
              To ensure fairness, all matches require confirmation:
            </p>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold shrink-0">
                  1
                </div>
                <div className="text-zinc-300">
                  <strong className="text-white">Opponent confirms</strong> within 48 hours → Match is recorded
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-semibold shrink-0">
                  2
                </div>
                <div className="text-zinc-300">
                  <strong className="text-white">No response after 48h</strong> → Auto-confirmed (prevents bottlenecks)
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-semibold shrink-0">
                  3
                </div>
                <div className="text-zinc-300">
                  <strong className="text-white">Disputed</strong> → Marked for admin review
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">5. Ratings Update</h3>
            <p className="text-zinc-300">
              Once confirmed, your rating updates instantly based on the ELO calculation. You can see your new rating and rating change immediately on your profile.
            </p>
          </Card>
        </section>

        {/* Leaderboards */}
        <section id="leaderboards" className="mb-12 scroll-mt-8">
          <h2 className="font-serif text-3xl font-bold text-white mb-6">
            📊 Leaderboards
          </h2>

          <Card className="bg-zinc-900 border-zinc-800 p-6 mb-4">
            <h3 className="text-xl font-semibold text-white mb-4">All-Time Rankings</h3>
            <p className="text-zinc-300">
              Your career stats and lifetime rating. These rankings show who are the true legends of TopSpin based on all matches played since joining.
            </p>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6 mb-4">
            <h3 className="text-xl font-semibold text-white mb-4">Last 30 Days</h3>
            <p className="text-zinc-300">
              Rankings based on recent performance. See who&apos;s been dominating lately and who&apos;s improving the fastest.
            </p>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Win Streaks</h3>
            <p className="text-zinc-300">
              Track current winning streaks and longest streaks. Can you achieve a 10-game win streak?
            </p>
          </Card>
        </section>

        {/* Tips */}
        <section id="tips" className="mb-12 scroll-mt-8">
          <h2 className="font-serif text-3xl font-bold text-white mb-6">
            💡 Tips for Improving Your Rating
          </h2>

          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <ul className="space-y-4 text-zinc-300">
              <li className="flex gap-3 items-start">
                <span className="text-primary text-xl">→</span>
                <span><strong className="text-white">Play consistently:</strong> More matches = more accurate rating and faster improvement</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-primary text-xl">→</span>
                <span><strong className="text-white">Challenge stronger players:</strong> Beating higher-rated opponents gives bigger rating gains</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-primary text-xl">→</span>
                <span><strong className="text-white">Learn from losses:</strong> Each match helps calibrate your true skill level</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-primary text-xl">→</span>
                <span><strong className="text-white">Build streaks:</strong> Winning streaks show momentum and consistency</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-primary text-xl">→</span>
                <span><strong className="text-white">Log results accurately:</strong> Honest reporting keeps the system fair for everyone</span>
              </li>
            </ul>
          </Card>
        </section>

        {/* Questions */}
        <section className="mb-12">
          <Card className="bg-zinc-900 border border-primary/50 p-6">
            <h3 className="text-xl font-semibold text-white mb-3">
              Still have questions?
            </h3>
            <p className="text-zinc-300 mb-4">
              If you need help or have feedback about the ranking system, reach out to the admin or suggest improvements in the Strativ Slack.
            </p>
            <Link href="/dashboard">
              <button className="bg-primary text-zinc-950 px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Back to Dashboard
              </button>
            </Link>
          </Card>
        </section>
      </div>
    </div>
  )
}
