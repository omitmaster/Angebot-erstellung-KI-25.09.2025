import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { analyzeOfferFile, analyzePrices, updatePricebook } from "@/lib/offer-price-analysis"

export async function POST(request: NextRequest) {
  try {
    const { offerId } = await request.json()

    if (!offerId) {
      return NextResponse.json({ error: "Offer ID required" }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    // Get offer details from database
    const { data: offer, error: offerError } = await supabase
      .from("uploaded_offers")
      .select("*")
      .eq("id", offerId)
      .single()

    if (offerError || !offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 })
    }

    // Update status to processing
    await supabase
      .from("uploaded_offers")
      .update({
        analysis_status: "processing",
        analysis_started_at: new Date().toISOString(),
      })
      .eq("id", offerId)

    try {
      // Step 1: Extract data from offer file
      console.log("[v0] Starting analysis for offer:", offer.filename)
      const extractedData = await analyzeOfferFile(offer.file_url, offer.filename, offer.file_type)

      // Step 2: Get market prices for comparison
      const { data: marketPrices } = await supabase.from("pricebook_items").select("*").limit(100)

      // Step 3: Analyze prices against market data
      const priceAnalysis = await analyzePrices(extractedData, marketPrices || [])

      // Step 4: Save extracted prices to database
      const extractedPricesData = extractedData.positions.map((position) => ({
        uploaded_offer_id: offerId,
        position_number: position.positionNumber,
        description: position.description,
        unit: position.unit,
        quantity: position.quantity,
        unit_price: position.unitPrice,
        total_price: position.totalPrice,
        category: position.category,
        trade_category: position.tradeCategory,
        work_type: position.workType,
        confidence_score: position.confidence,
        extraction_method: "ai_analysis",
      }))

      const { error: pricesError } = await supabase.from("extracted_prices").insert(extractedPricesData)

      if (pricesError) {
        console.error("[v0] Failed to save extracted prices:", pricesError)
      }

      // Step 5: Save analysis results
      const { error: analysisError } = await supabase.from("price_analysis_results").insert({
        uploaded_offer_id: offerId,
        total_positions: priceAnalysis.totalPositions,
        analyzed_positions: priceAnalysis.analyzedPositions,
        matched_positions: priceAnalysis.matchedPositions,
        new_positions: priceAnalysis.newPositions,
        average_markup_pct: priceAnalysis.averageMarkupPct,
        competitive_score: priceAnalysis.competitiveScore,
        price_trend: priceAnalysis.priceTrend,
        recommendations: priceAnalysis.recommendations,
        price_adjustments: priceAnalysis.priceAdjustments,
        data_quality_score: priceAnalysis.dataQualityScore,
        completeness_pct: priceAnalysis.completenessPct,
      })

      if (analysisError) {
        console.error("[v0] Failed to save analysis results:", analysisError)
      }

      // Step 6: Update offer with extracted metadata
      await supabase
        .from("uploaded_offers")
        .update({
          analysis_status: "completed",
          analysis_completed_at: new Date().toISOString(),
          offer_title: extractedData.offerTitle,
          offer_date: extractedData.offerDate,
          customer_name: extractedData.customerName,
          project_type: extractedData.projectType,
          total_amount: extractedData.totalAmount,
          currency: extractedData.currency,
          metadata: extractedData.metadata,
        })
        .eq("id", offerId)

      // Step 7: Update pricebook (if enabled)
      try {
        await updatePricebook(extractedData.positions, priceAnalysis)
      } catch (updateError) {
        console.error("[v0] Pricebook update failed:", updateError)
        // Don't fail the entire analysis if pricebook update fails
      }

      console.log("[v0] Analysis completed successfully for offer:", offer.filename)

      return NextResponse.json({
        success: true,
        extractedData,
        priceAnalysis,
      })
    } catch (analysisError) {
      console.error("[v0] Analysis failed:", analysisError)

      // Update status to failed
      await supabase
        .from("uploaded_offers")
        .update({
          analysis_status: "failed",
          analysis_error: analysisError instanceof Error ? analysisError.message : "Unknown error",
        })
        .eq("id", offerId)

      return NextResponse.json({ error: "Analysis failed", details: analysisError }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] Analysis API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
