"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface InterestModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function InterestModal({ isOpen, onClose, onSuccess }: InterestModalProps) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate email domain
    if (!email.endsWith("@strativ.se")) {
      setError("Only @strativ.se email addresses are allowed")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit")
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Join the Waitlist</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Enter your Strativ email to express your interest
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.name@strativ.se"
              required
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary transition-colors"
            />
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/50"
          >
            {loading ? "Submitting..." : "Count Me In! 🏓"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
