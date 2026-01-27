import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import UsersTable from "@/components/admin-users-table";

export default async function UsersPage() {
  const session = await auth();

  // Check if user is authenticated
  if (!session) {
    redirect("/");
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
          <h1 className="font-serif text-2xl text-white">Users</h1>
          <p className="text-sm text-zinc-400">
            View all registered users.
          </p>
        </div>
      </div>

      <UsersTable users={usersWithStats} />
    </div>
  );
}
