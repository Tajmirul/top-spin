"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PLAYER_TIERS, getTierBadgeClasses } from "@/lib/tiers";
import { DialogDescription } from "@radix-ui/react-dialog";

interface TierInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TierInfoModal({ isOpen, onClose }: TierInfoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Player Tiers</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Climb the ranks and earn your place among the elite! Your tier is
            determined by your ELO rating.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            {Object.values(PLAYER_TIERS).map((tier) => (
              <div key={tier.label} className="flex items-center gap-3 py-2">
                <div className="text-2xl">{tier.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm px-2 py-0.5 rounded-full font-medium ${getTierBadgeClasses(tier)}`}
                    >
                      {tier.label}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    {tier.max === Infinity
                      ? `${tier.min}+ rating`
                      : `${tier.min} - ${tier.max} rating`}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-primary/10 border border-primary/20">
            <p className="text-xs text-zinc-300">
              💡 <span className="font-medium">Pro Tip:</span> Win matches
              against higher-rated players to gain more rating points and climb
              the tiers faster!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
