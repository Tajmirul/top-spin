import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { matchType, partnerEmail, opponent1Email, opponent2Email, message } = body

    // Validate required fields
    if (!matchType || !opponent1Email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (matchType === "DOUBLES" && (!opponent2Email || !partnerEmail)) {
      return NextResponse.json(
        { error: "Doubles match requires all participants" },
        { status: 400 }
      )
    }

    // Validate all emails are @strativ.se
    const emails = [opponent1Email, opponent2Email, partnerEmail].filter(Boolean)
    for (const email of emails) {
      if (!email.endsWith("@strativ.se")) {
        return NextResponse.json(
          { error: "All emails must be @strativ.se addresses" },
          { status: 400 }
        )
      }
    }

    // Helper function to find or create user by email
    const findOrCreateUser = async (email: string) => {
      return await prisma.user.upsert({
        where: { email },
        update: {}, // Don't update if exists
        create: {
          email,
          name: '', // Name will be set on first sign-in
          rating: 1500,
        },
      })
    }

    // Find or create all participants
    const opponent1 = await findOrCreateUser(opponent1Email)
    const opponent2 = opponent2Email ? await findOrCreateUser(opponent2Email) : null
    const partner = partnerEmail ? await findOrCreateUser(partnerEmail) : null

    // Create challenge with 7 days expiry
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const challenge = await prisma.challenge.create({
      data: {
        matchType,
        challengerId: session.user.id,
        partnerId: partner?.id,
        challengedId: opponent1.id,
        challengedId2: opponent2?.id,
        status: "PENDING",
        message: message || null,
        expiresAt,
      },
      include: {
        challenger: { select: { id: true, name: true, email: true } },
        partner: { select: { id: true, name: true, email: true } },
        challenged: { select: { id: true, name: true, email: true } },
        challenged2: { select: { id: true, name: true, email: true } },
      },
    })

    // TODO: Send email notifications to all participants
    // For now, just return success

    return NextResponse.json({ success: true, challenge })
  } catch (error) {
    console.error("Failed to create challenge:", error)
    return NextResponse.json(
      { error: "Failed to create challenge" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's challenges (sent and received)
    const challenges = await prisma.challenge.findMany({
      where: {
        OR: [
          { challengerId: session.user.id },
          { challengedId: session.user.id },
        ],
      },
      include: {
        challenger: {
          select: {
            id: true,
            name: true,
            image: true,
            rating: true,
          },
        },
        challenged: {
          select: {
            id: true,
            name: true,
            image: true,
            rating: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ challenges })
  } catch (error) {
    console.error("Failed to fetch challenges:", error)
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 }
    )
  }
}
