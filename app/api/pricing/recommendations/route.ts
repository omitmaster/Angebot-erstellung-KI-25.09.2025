import { type NextRequest, NextResponse } from "next/server"
import { getPricingRecommendations } from "@/lib/price-database-integration"

export async function POST(request: NextRequest) {
  try {
    const { projectType, tradeCategory, positions } = await request.json()

    if (!projectType || !tradeCategory || !positions || !Array.isArray(positions)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Getting pricing recommendations for", positions.length, "positions")

    const recommendations = await getPricingRecommendations(projectType, tradeCategory, positions)

    return NextResponse.json({
      success: true,
      recommendations,
      summary: {
        totalPositions: positions.length,
        withRecommendations: recommendations.filter((r) => r.recommendedPrice > 0).length,
        averageConfidence: recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length,
      },
    })
  } catch (error) {
    console.error("[v0] Pricing recommendations API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
