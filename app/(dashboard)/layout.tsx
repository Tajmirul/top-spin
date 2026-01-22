import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { TierInfoButton } from "@/components/tier-info-button"
import { Footer } from "@/components/footer"
import { TooltipProvider } from "@/components/ui/tooltip"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/")
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <DashboardNav />
        <main className="container mx-auto px-4 pt-4 pb-8 flex-1">
          {children}
        </main>
        <Footer />
        <TierInfoButton />
      </div>
    </TooltipProvider>
  )
}
