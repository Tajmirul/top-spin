import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate domain
    if (!email.endsWith("@strativ.se")) {
      return NextResponse.json(
        { error: "Only @strativ.se email addresses are allowed" },
        { status: 400 },
      );
    }

    // Create or update interested user
    const user = await prisma.interestedUser.upsert({
      where: { email },
      update: { updatedAt: new Date() },
      create: { email },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Interest API error:", error);

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "This email is already registered" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to register interest" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const count = await prisma.interestedUser.count();
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Interest count error:", error);
    return NextResponse.json({ error: "Failed to get count" }, { status: 500 });
  }
}
