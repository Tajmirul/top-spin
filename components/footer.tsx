import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-900 py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-zinc-400">
          <div>
            © {new Date().getFullYear()} TopSpin - Strativ Table Tennis Rankings
          </div>
          <div className="flex gap-6">
            <Link 
              href="/how-it-works" 
              className="hover:text-primary transition-colors"
            >
              How It Works
            </Link>
            <Link 
              href="/how-it-works#elo" 
              className="hover:text-primary transition-colors"
            >
              ELO System
            </Link>
            <Link 
              href="/how-it-works#tiers" 
              className="hover:text-primary transition-colors"
            >
              Tiers
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
