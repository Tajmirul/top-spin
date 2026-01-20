"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, TrendingUp } from "lucide-react";
import { InterestModal } from "./interest-modal";
import Image from "next/image";

export function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSuccess = () => {
    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-zinc-900 border-2 border-primary/50">
          <CardHeader className="gap-y-0">
            <CardTitle className="text-3xl font-serif text-white text-center">
              Thank You for Your Interest! 🎉
            </CardTitle>
            <CardDescription className="text-zinc-400 text-center text-lg">
              You&apos;ve been added to our early access list.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-zinc-300 text-center">
              We&apos;re thrilled that you want to be part of the Table Tennis
              Ranking revolution! Your interest helps us validate this idea and
              build something awesome.
            </p>
            <div className="bg-zinc-800 p-6 border border-zinc-700">
              <h3 className="font-semibold mb-3 text-white text-lg">
                What happens next?
              </h3>
              <ul className="space-y-2 text-zinc-300">
                <li>✅ You&apos;re on the early access list</li>
                <li>📧 We&apos;ll email you when the app launches</li>
                <li>
                  🎯 You&apos;ll be among the first to track your victories
                </li>
                <li>💬 We might reach out for feedback as we build</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <InterestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <Image
            src={"/ping-pong-2.png"}
            alt="Ping Pong"
            width={200}
            height={200}
            className="mx-auto mb-8"
          />

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-white max-sm:mb-2">
            Table Tennis Ranker
          </h1>

          <p className="text-lg sm:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Settle office rivalries once and for all. Track matches, climb
            rankings, and prove you&apos;re the ping pong champion.
          </p>

          {/* CTA Button */}
          <div className="mt-8">
            <Button
              size="lg"
              onClick={() => setIsModalOpen(true)}
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/50"
            >
              I&apos;m Interested - Join Waitlist
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-20 max-w-4xl mx-auto">
          <Card className="bg-zinc-900 border-zinc-800 hover:border-primary transition-colors gap-y-2">
            <CardHeader>
              <div className="w-12 h-12 bg-zinc-800 flex items-center justify-center mb-4 border border-zinc-700 rounded-full">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-white">Easy Match Logging</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-zinc-400">
                Log wins and losses in seconds. Your opponent gets notified to
                confirm.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 hover:border-primary transition-colors gap-y-2">
            <CardHeader>
              <div className="w-12 h-12 bg-zinc-800 flex items-center justify-center mb-4 border border-zinc-700 rounded-full">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-white">Live Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-zinc-400">
                See where you stand with real-time rankings and monthly
                leaderboards.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 hover:border-primary transition-colors gap-y-2">
            <CardHeader>
              <div className="w-12 h-12 bg-zinc-800 flex items-center justify-center mb-4 border border-zinc-700 rounded-full">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-white">Win Streaks</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-zinc-400">
                Track your winning streaks and head-to-head stats against
                rivals.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12 text-white">
            How It Works
          </h2>

          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <div className="shrink-0 w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center font-semibold border border-primary/50 rounded-full">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-white">
                  Sign Up
                </h3>
                <p className="text-zinc-400">
                  Click the button above to express your interest and sign in
                  with Google.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="shrink-0 w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center font-semibold border border-primary/50 rounded-full">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-white">
                  Play & Log
                </h3>
                <p className="text-zinc-400">
                  After a match, log the result. Your opponent confirms within
                  24-48 hours.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="shrink-0 w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center font-semibold border border-primary/50 rounded-full">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-white">
                  Climb the Ranks
                </h3>
                <p className="text-zinc-400">
                  Watch your position rise as you dominate the office table
                  tennis scene!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-20 text-center">
          <p className="text-zinc-400 mb-1">
            Help us validate this idea. If you&apos;re interested, join our
            waitlist and we&apos;ll notify you when it&apos;s ready!
          </p>
          <p className="text-primary font-semibold mb-6">
            We&apos;ll build the app if we get 10 interested people.
          </p>
          <Button
            size="lg"
            onClick={() => setIsModalOpen(true)}
            className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/50"
          >
            Count Me In! 🏓
          </Button>
        </div>
      </div>
    </div>
  );
}
