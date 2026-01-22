"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { TierInfoModal } from "@/components/tier-info-modal";

export function TierInfoButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 shadow-lg"
        size="icon"
        title="View Player Tiers"
      >
        <Trophy className="h-5 w-5 text-primary" />
      </Button>

      <TierInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
