"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { SubmitResultModal } from "@/components/submit-result-modal";
import { LogOut, Shield } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserRole } from "@prisma/client";

export function DashboardNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isSubmitResultModalOpen, setIsSubmitResultModalOpen] = useState(false);
  
  const isAdmin = session?.user?.role === UserRole.ADMIN;

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Image
                  src={"/logo.png"}
                  alt="TopSpin Logo"
                  width={32}
                  height={32}
                />
                <span className="font-serif text-xl font-semibold">TopSpin</span>
              </Link>
              
              {/* Admin Navigation */}
              {isAdmin && (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/admin/users"
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors ${
                      pathname === "/admin/users"
                        ? "bg-amber-500/10 text-amber-500"
                        : "text-zinc-400 hover:text-amber-500 hover:bg-amber-500/5"
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                </div>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <Button
                size={"sm"}
                onClick={() => setIsSubmitResultModalOpen(true)}
                className=""
              >
                Submit Result
              </Button>

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
                  <div className="flex items-center gap-1.5 font-medium text-white">
                    {session?.user?.name}
                    {isAdmin && (
                      <Shield className="h-3.5 w-3.5 text-amber-500" />
                    )}
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

      <SubmitResultModal
        isOpen={isSubmitResultModalOpen}
        onClose={() => setIsSubmitResultModalOpen(false)}
      />
    </>
  );
}
