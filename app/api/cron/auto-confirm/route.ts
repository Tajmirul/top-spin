import { NextResponse } from "next/server";
import { autoConfirmExpiredMatches } from "@/lib/auto-confirm";

/**
 * Cron job to automatically confirm matches after 48 hours
 * Runs every hour to check for matches past their autoConfirmAt time
 */
export async function GET() {
  try {
    const result = await autoConfirmExpiredMatches();

    return NextResponse.json({
      message: `Auto-confirmed ${result.confirmedCount} matches, ${result.failedCount} failed`,
      ...result,
      timestamp: new Date().toISOString(),
      success: true,
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      {
        error: "Failed to process auto-confirmations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
