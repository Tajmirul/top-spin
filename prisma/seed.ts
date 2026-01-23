import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { calculateELO, ELOResult } from "../lib/elo";

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  await prisma.ratingHistory.deleteMany();
  await prisma.match.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Cleared existing data");

  // Create 10 users
  await prisma.user.createMany({
    data: [
      {
        email: "tajmirul.islam@strativ.se",
        name: "Tajmirul Islam",
        image: "https://i.pravatar.cc/150?img=11",
        rating: 1500,
      },
      {
        email: "alice.johnson@strativ.se",
        name: "Alice Johnson",
        image: "https://i.pravatar.cc/150?img=1",
        rating: 1500,
      },
      {
        email: "bob.smith@strativ.se",
        name: "Bob Smith",
        image: "https://i.pravatar.cc/150?img=2",
        rating: 1500,
      },
      {
        email: "carol.white@strativ.se",
        name: "Carol White",
        image: "https://i.pravatar.cc/150?img=3",
        rating: 1500,
      },
      {
        email: "david.brown@strativ.se",
        name: "David Brown",
        image: "https://i.pravatar.cc/150?img=4",
        rating: 1500,
      },
      {
        email: "eve.davis@strativ.se",
        name: "Eve Davis",
        image: "https://i.pravatar.cc/150?img=5",
        rating: 1500,
      },
      {
        email: "frank.miller@strativ.se",
        name: "Frank Miller",
        image: "https://i.pravatar.cc/150?img=6",
        rating: 1500,
      },
      {
        email: "grace.wilson@strativ.se",
        name: "Grace Wilson",
        image: "https://i.pravatar.cc/150?img=7",
        rating: 1500,
      },
      {
        email: "henry.moore@strativ.se",
        name: "Henry Moore",
        image: "https://i.pravatar.cc/150?img=8",
        rating: 1500,
      },
      {
        email: "ivy.taylor@strativ.se",
        name: "Ivy Taylor",
        image: "https://i.pravatar.cc/150?img=9",
        rating: 1500,
      },
      {
        email: "jack.anderson@strativ.se",
        name: "Jack Anderson",
        image: "https://i.pravatar.cc/150?img=10",
        rating: 1500,
      },
    ],
  });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
  });

  console.log(`✅ Created ${users.length} users`);

  // Helper function to create and process match
  async function createMatch(
    matchType: "SINGLES" | "DOUBLES",
    winner1Id: string,
    loser1Id: string,
    winner2Id: string | null,
    loser2Id: string | null,
    winnerScore: number,
    loserScore: number,
    daysAgo: number,
  ) {
    // Get current ratings
    const winner1 = await prisma.user.findUnique({ where: { id: winner1Id } });
    const loser1 = await prisma.user.findUnique({ where: { id: loser1Id } });

    if (!winner1 || !loser1) throw new Error("Players not found");

    let eloResult: ELOResult;

    if (matchType === "SINGLES") {
      eloResult = calculateELO({
        winner1Rating: winner1.rating,
        loser1Rating: loser1.rating,
      });

      // Create match
      const match = await prisma.match.create({
        data: {
          matchType: "SINGLES",
          submittedById: winner1Id,
          winner1Id,
          loser1Id,
          winnerScore,
          loserScore,
          status: "CONFIRMED",
          winner1RatingChange: eloResult.winner1Change,
          loser1RatingChange: eloResult.loser1Change,
          confirmedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          autoConfirmAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        },
      });

      // Update ratings
      await prisma.user.update({
        where: { id: winner1Id },
        data: { rating: eloResult.winner1NewRating },
      });
      await prisma.user.update({
        where: { id: loser1Id },
        data: { rating: eloResult.loser1NewRating },
      });

      // Create rating history
      await prisma.ratingHistory.createMany({
        data: [
          {
            userId: winner1Id,
            rating: eloResult.winner1NewRating,
            change: eloResult.winner1Change,
            matchId: match.id,
            createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          },
          {
            userId: loser1Id,
            rating: eloResult.loser1NewRating,
            change: eloResult.loser1Change,
            matchId: match.id,
            createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          },
        ],
      });
    } else {
      // DOUBLES
      const winner2 = await prisma.user.findUnique({
        where: { id: winner2Id! },
      });
      const loser2 = await prisma.user.findUnique({ where: { id: loser2Id! } });

      if (!winner2 || !loser2) throw new Error("Players not found");

      eloResult = calculateELO({
        winner1Rating: winner1.rating,
        loser1Rating: loser1.rating,
        winner2Rating: winner2.rating,
        loser2Rating: loser2.rating,
      });

      // Create match
      const match = await prisma.match.create({
        data: {
          matchType: "DOUBLES",
          submittedById: winner1Id,
          winner1Id,
          winner2Id,
          loser1Id,
          loser2Id,
          winnerScore,
          loserScore,
          status: "CONFIRMED",
          winner1RatingChange: eloResult.winner1Change,
          winner2RatingChange: eloResult.winner2Change,
          loser1RatingChange: eloResult.loser1Change,
          loser2RatingChange: eloResult.loser2Change,
          confirmedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          autoConfirmAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        },
      });

      // Update ratings
      await prisma.user.update({
        where: { id: winner1Id },
        data: { rating: eloResult.winner1NewRating },
      });
      await prisma.user.update({
        where: { id: winner2Id! },
        data: { rating: eloResult.winner2NewRating },
      });
      await prisma.user.update({
        where: { id: loser1Id },
        data: { rating: eloResult.loser1NewRating },
      });
      await prisma.user.update({
        where: { id: loser2Id! },
        data: { rating: eloResult.loser2NewRating },
      });

      // Create rating history
      await prisma.ratingHistory.createMany({
        data: [
          {
            userId: winner1Id,
            rating: eloResult.winner1NewRating,
            change: eloResult.winner1Change,
            matchId: match.id,
            createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          },
          {
            userId: winner2Id!,
            rating: eloResult.winner2NewRating!,
            change: eloResult.winner2Change!,
            matchId: match.id,
            createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          },
          {
            userId: loser1Id,
            rating: eloResult.loser1NewRating,
            change: eloResult.loser1Change,
            matchId: match.id,
            createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          },
          {
            userId: loser2Id!,
            rating: eloResult.loser2NewRating!,
            change: eloResult.loser2Change!,
            matchId: match.id,
            createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          },
        ],
      });
    }

    return eloResult;
  }

  // Create 10 matches (mix of singles and doubles)
  console.log("🎮 Creating matches...");

  // Match 1: Singles - Tajmirul vs Alice (10 days ago)
  await createMatch("SINGLES", users[0].id, users[1].id, null, null, 11, 8, 10);
  console.log("✅ Match 1: Tajmirul defeated Alice (Singles)");

  // Match 2: Doubles - Carol & David vs Eve & Frank (9 days ago)
  await createMatch(
    "DOUBLES",
    users[3].id,
    users[5].id,
    users[4].id,
    users[6].id,
    11,
    9,
    9,
  );
  console.log("✅ Match 2: Carol & David defeated Eve & Frank (Doubles)");

  // Match 3: Singles - Grace vs Henry (8 days ago)
  await createMatch("SINGLES", users[7].id, users[8].id, null, null, 11, 7, 8);
  console.log("✅ Match 3: Grace defeated Henry (Singles)");

  // Match 4: Singles - Tajmirul vs Ivy (7 days ago)
  await createMatch("SINGLES", users[0].id, users[9].id, null, null, 11, 9, 7);
  console.log("✅ Match 4: Tajmirul defeated Ivy (Singles)");

  // Match 5: Doubles - Tajmirul & Bob vs Carol & David (6 days ago)
  await createMatch(
    "DOUBLES",
    users[0].id,
    users[3].id,
    users[2].id,
    users[4].id,
    11,
    8,
    6,
  );
  console.log("✅ Match 5: Tajmirul & Bob defeated Carol & David (Doubles)");

  // Match 6: Singles - Eve vs Tajmirul (5 days ago)
  await createMatch("SINGLES", users[5].id, users[0].id, null, null, 11, 9, 5);
  console.log("✅ Match 6: Eve defeated Tajmirul (Singles)");

  // Match 7: Singles - Bob vs Grace (4 days ago)
  await createMatch("SINGLES", users[2].id, users[7].id, null, null, 11, 9, 4);
  console.log("✅ Match 7: Bob defeated Grace (Singles)");

  // Match 8: Doubles - Henry & Tajmirul vs Jack & Alice (3 days ago)
  await createMatch(
    "DOUBLES",
    users[8].id,
    users[10].id,
    users[0].id,
    users[1].id,
    11,
    6,
    3,
  );
  console.log("✅ Match 8: Henry & Tajmirul defeated Jack & Alice (Doubles)");

  // Match 9: Singles - Tajmirul vs David (2 days ago)
  await createMatch("SINGLES", users[0].id, users[4].id, null, null, 11, 7, 2);
  console.log("✅ Match 9: Tajmirul defeated David (Singles)");

  // Match 10: Doubles - Eve & Frank vs Grace & Tajmirul (1 day ago)
  await createMatch(
    "DOUBLES",
    users[5].id,
    users[7].id,
    users[6].id,
    users[0].id,
    11,
    8,
    1,
  );
  console.log("✅ Match 10: Eve & Frank defeated Grace & Tajmirul (Doubles)");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📊 Final standings:");

  const finalUsers = await prisma.user.findMany({
    orderBy: { rating: "desc" },
    select: { name: true, rating: true },
  });

  finalUsers.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name}: ${user.rating}`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
