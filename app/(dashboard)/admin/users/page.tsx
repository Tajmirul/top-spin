import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { AdminUsersTable } from "@/components/admin-users-table";

export default async function AdminUsersPage() {
  const session = await auth();

  // Check if user is authenticated
  if (!session) {
    redirect("/");
  }

  // Check if user is admin
  if (session.user.role !== UserRole.ADMIN) {
    redirect("/dashboard");
  }

  // Fetch all users
  const users = await prisma.user.findMany({
    orderBy: [{ role: "desc" }, { rating: "desc" }],
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      rating: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          matchesAsWinner1: { where: { status: "CONFIRMED" } },
          matchesAsLoser1: { where: { status: "CONFIRMED" } },
        },
      },
    },
  });

  // Calculate stats for each user
  const usersWithStats = users.map((user) => {
    const totalMatches = user._count.matchesAsWinner1 + user._count.matchesAsLoser1;
    const wonMatches = user._count.matchesAsWinner1;
    const winRate = totalMatches > 0 ? (wonMatches / totalMatches) * 100 : 0;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      rating: user.rating,
      role: user.role,
      createdAt: user.createdAt,
      totalMatches,
      wonMatches,
      winRate,
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-white">User Management</h1>
          <p className="text-sm text-zinc-400">
            Manage all users in the system
          </p>
        </div>
      </div>

      <AdminUsersTable users={usersWithStats} />
    </div>
  );
}
