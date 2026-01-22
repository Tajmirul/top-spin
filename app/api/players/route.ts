import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const players = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        rating: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({ players })
  } catch (error) {
    console.error("Failed to fetch players:", error)
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    )
  }
}
