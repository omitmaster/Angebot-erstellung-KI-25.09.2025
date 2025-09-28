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

    // Fetch uploaded offers with analysis results
    const { data: offers, error } = await supabase
      .from("uploaded_offers")
      .select(`
        id,
        filename,
        analysis_status,
        upload_date,
        total_amount,
        offer_title,
        customer_name,
        price_analysis_results (
          analyzed_positions,
          total_positions,
          competitive_score,
          data_quality_score
        )
      `)
      .order("upload_date", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Error fetching offers:", error)
      return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 })
    }

    // Transform data for frontend
    const transformedOffers =
      offers?.map((offer) => ({
        id: offer.id,
        filename: offer.filename,
        analysis_status: offer.analysis_status,
        upload_date: offer.upload_date,
        total_amount: offer.total_amount,
        offer_title: offer.offer_title,
        customer_name: offer.customer_name,
        analyzed_positions: offer.price_analysis_results?.[0]?.analyzed_positions || 0,
        total_positions: offer.price_analysis_results?.[0]?.total_positions || 0,
        competitive_score: offer.price_analysis_results?.[0]?.competitive_score || 0,
        data_quality_score: offer.price_analysis_results?.[0]?.data_quality_score || 0,
      })) || []

    return NextResponse.json(transformedOffers)
  } catch (error) {
    console.error("Error in offers API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
