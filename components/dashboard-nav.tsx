"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { SubmitResultModal } from "@/components/submit-result-modal";
import { LogOut } from "lucide-react";
import Image from "next/image";

export function DashboardNav() {
  const { data: session } = useSession();
  const [isSubmitResultModalOpen, setIsSubmitResultModalOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image
                src={"/logo.png"}
                alt="TopSpin Logo"
                width={32}
                height={32}
              />
              <span className="font-serif text-xl font-semibold">TopSpin</span>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <Button
                size={"sm"}
                onClick={() => setIsSubmitResultModalOpen(true)}
                className=""
              >
                Submit Result
              </Button>

              {/* <Button
                size={"sm"}
                onClick={() => setIsChallengeModalOpen(true)}
                className="bg-primary text-zinc-950 hover:bg-primary/90"
              >
                Challenge
              </Button> */}

              {/* User info */}
              <Link
                href={`/players/${session?.user?.id}`}
                className="hidden sm:flex items-center gap-3 text-sm"
              >
                {session?.user?.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-8 w-8 rounded-full border-2 border-zinc-700"
                    width={32}
                    height={32}
                  />
                )}
                <div className="text-right">
                  <div className="font-medium text-white">
                    {session?.user?.name}
                  </div>
                  <div className="text-xs text-zinc-400">
                    Rating: {session?.user?.rating}
                  </div>
                </div>
              </Link>

              {/* Sign out */}
              <Button
                variant="ghost"
                size="icon-sm"
                className=""
                onClick={() => signOut()}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* <ChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
      /> */}

      <SubmitResultModal
        isOpen={isSubmitResultModalOpen}
        onClose={() => setIsSubmitResultModalOpen(false)}
      />
    </>
  );
}
