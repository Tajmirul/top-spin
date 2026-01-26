"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { UserRole } from "@prisma/client";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated?: () => void;
}

export function CreateUserModal({
  isOpen,
  onClose,
  onUserCreated,
}: CreateUserModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [rating, setRating] = useState("1500");
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!email || !email.endsWith("@strativ.se")) {
      toast.error("Email must end with @strativ.se");
      return;
    }

    if (!name || name.trim().length === 0) {
      toast.error("Name is required");
      return;
    }

    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5000) {
      toast.error("Rating must be between 0 and 5000");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, rating: ratingNum, role }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`User ${name} created successfully!`);
        resetForm();
        onClose();
        onUserCreated?.();
      } else {
        toast.error(data.error || "Failed to create user");
      }
    } catch (error) {
      console.error("Failed to create user:", error);
      toast.error("Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setName("");
    setRating("1500");
    setRole(UserRole.USER);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Create New User
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <Label className="text-zinc-400">Email *</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.doe@strativ.se"
              className="mt-2 border-zinc-700 bg-zinc-800 text-white"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Must end with @strativ.se
            </p>
          </div>

          {/* Name */}
          <div>
            <Label className="text-zinc-400">Name *</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="mt-2 border-zinc-700 bg-zinc-800 text-white"
            />
          </div>

          {/* Initial Rating */}
          <div>
            <Label className="text-zinc-400">Initial Rating</Label>
            <Input
              type="number"
              min="0"
              max="5000"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="1500"
              className="mt-2 border-zinc-700 bg-zinc-800 text-white"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Default: 1500 (standard starting rating)
            </p>
          </div>

          {/* Role */}
          <div>
            <Label className="text-zinc-400">Role</Label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                onClick={() => setRole(UserRole.USER)}
                className={`flex items-center justify-center gap-2 border px-4 py-2 transition-colors ${
                  role === UserRole.USER
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                <span className="font-medium">User</span>
              </button>
              <button
                onClick={() => setRole(UserRole.ADMIN)}
                className={`flex items-center justify-center gap-2 border px-4 py-2 transition-colors ${
                  role === UserRole.ADMIN
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                <span className="font-medium">Admin</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-zinc-700 text-zinc-400"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-primary text-zinc-950 hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
