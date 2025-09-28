import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    // Get total offers count
    const { count: totalOffers } = await supabase.from("uploaded_offers").select("*", { count: "exact", head: true })

    // Get processed offers count
    const { count: processedOffers } = await supabase
      .from("uploaded_offers")
      .select("*", { count: "exact", head: true })
      .eq("analysis_status", "completed")

    // Get total positions analyzed
    const { data: positionsData } = await supabase.from("price_analysis_results").select("analyzed_positions")

    const totalPositions = positionsData?.reduce((sum, result) => sum + (result.analyzed_positions || 0), 0) || 0

    // Get pending price updates
    const { count: pendingUpdates } = await supabase
      .from("price_updates")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")

    // Get average quality score
    const { data: qualityData } = await supabase
      .from("price_analysis_results")
      .select("data_quality_score")
      .not("data_quality_score", "is", null)

    const averageQuality =
      qualityData?.length > 0
        ? qualityData.reduce((sum, result) => sum + (result.data_quality_score || 0), 0) / qualityData.length
        : 0

    // Calculate market coverage (simplified metric)
    const marketCoverage = processedOffers && totalOffers ? (processedOffers / totalOffers) * 100 : 0

    const stats = {
      total_offers: totalOffers || 0,
      processed_offers: processedOffers || 0,
      total_positions: totalPositions,
      price_updates_pending: pendingUpdates || 0,
      average_quality_score: averageQuality,
      market_coverage_pct: marketCoverage,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
