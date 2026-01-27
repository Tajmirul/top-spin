"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Crown, Search, UserCog } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { CreateUserModal } from "./create-user-modal";
import Link from "next/link";
import { User, UserRole } from "@prisma/client";
import { useUser } from "@/hooks/useUser";

interface UsersTableProps {
  users: (Pick<
    User,
    "id" | "email" | "name" | "image" | "rating" | "role" | "createdAt"
  > & {
    totalMatches: number;
    wonMatches: number;
    winRate: number;
  })[];
}

function UsersTable({ users: initialUsers }: UsersTableProps) {
  const { user: authUser } = useUser();
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole =
      currentRole === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;

    if (
      !confirm(
        `Are you sure you want to change this user's role to ${newRole}?`,
      )
    ) {
      return;
    }

    setUpdatingRole(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        toast.success(`User role updated to ${newRole}`);
        // Update local state
        setUsers(
          users.map((u) =>
            u.id === userId ? { ...u, role: newRole as UserRole } : u,
          ),
        );
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update role");
      }
    } catch (error) {
      console.error("Failed to update role:", error);
      toast.error("Failed to update role");
    } finally {
      setUpdatingRole(null);
    }
  };

  return (
    <>
      <Card className="border-zinc-800 bg-zinc-900 p-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by name or email..."
              className="pl-10 border-zinc-700 bg-zinc-800 text-white"
            />
          </div>
          {authUser?.role === UserRole.ADMIN && (
            <Button
              onClick={() => setShowCreateUser(true)}
              className="bg-primary text-zinc-950 hover:bg-primary/90"
            >
              <UserCog className="h-4 w-4 mr-2" />
              Create User
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-sm text-zinc-400">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Rating</th>
                <th className="pb-3 font-medium">Matches</th>
                <th className="pb-3 font-medium">Win Rate</th>
                <th className="pb-3 font-medium">Role</th>
                {authUser?.role === UserRole.ADMIN && (
                  <th className="pb-3 font-medium">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-zinc-800 last:border-0"
                >
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name || "User"}
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-600 text-xs font-semibold">
                          {user.name?.charAt(0) || "?"}
                        </div>
                      )}
                      <Link
                        href={`/players/${user.id}`}
                        className="font-medium text-white hover:text-primary transition-colors"
                      >
                        {user.name || "Unnamed"}
                      </Link>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-zinc-400">{user.email}</td>
                  <td className="py-3">
                    <span className="font-semibold text-primary">
                      {user.rating}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-zinc-300">
                    <span className="text-primary">{user.wonMatches}</span>
                    {" - "}
                    <span className="text-red-400">
                      {user.totalMatches - user.wonMatches}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-zinc-300">
                    {user.totalMatches > 0
                      ? `${user.winRate.toFixed(1)}%`
                      : "—"}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {user.role === UserRole.ADMIN && (
                        <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-500">
                          <Crown className="h-3 w-3" />
                          Admin
                        </div>
                      )}
                      {user.role === UserRole.USER && (
                        <div className="flex items-center gap-1 rounded-full bg-zinc-700 px-2 py-1 text-xs font-medium text-zinc-300">
                          <Shield className="h-3 w-3" />
                          User
                        </div>
                      )}
                    </div>
                  </td>
                  {authUser?.role === UserRole.ADMIN && (
                    <td className="py-3">
                      <Button
                        size="sm"
                        onClick={() => handleToggleRole(user.id, user.role)}
                        disabled={updatingRole === user.id}
                        className="text-xs bg-zinc-700 text-white hover:bg-zinc-600"
                      >
                        {updatingRole === user.id ? (
                          "Updating..."
                        ) : (
                          <>
                            {user.role === UserRole.ADMIN
                              ? "Remove Admin"
                              : "Make Admin"}
                          </>
                        )}
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="py-8 text-center text-zinc-400">
              No users found matching your search.
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-zinc-400">
          Total users: {filteredUsers.length} (
          {users.filter((u) => u.role === UserRole.ADMIN).length} admins)
        </div>
      </Card>

      <CreateUserModal
        isOpen={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        onUserCreated={() => {}}
      />
    </>
  );
}

export default UsersTable;
