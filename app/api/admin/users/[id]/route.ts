import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";

// Update user role
export async function PATCH(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> },
) {
  const params = await paramsPromise;

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

    const { role } = await request.json();

    if (!role || (role !== UserRole.USER && role !== UserRole.ADMIN)) {
      return NextResponse.json(
        { error: "Invalid role. Must be USER or ADMIN" },
        { status: 400 },
      );
    }

    const userId = params.id;

    // Prevent user from removing their own admin role
    if (userId === session.user.id && role === UserRole.USER) {
      return NextResponse.json(
        { error: "You cannot remove your own admin role" },
        { status: 400 },
      );
    }

    // Update user role
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: role as UserRole },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
