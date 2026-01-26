import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }

    const { email, name, rating, role } = await request.json();

    // Validation
    if (!email || !email.endsWith("@strativ.se")) {
      return NextResponse.json(
        { error: "Email must end with @strativ.se" },
        { status: 400 },
      );
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 },
      );
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name: name.trim(),
        rating: rating ? parseInt(rating) : 1500,
        role: role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.USER,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        rating: user.rating,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}

// Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      orderBy: [{ role: "desc" }, { rating: "desc" }],
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        rating: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
