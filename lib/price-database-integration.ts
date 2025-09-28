import { createClient } from "@/lib/supabase/server"
import type { OfferPosition } from "./offer-price-analysis"

function createSupabaseClient() {
  return createClient()
}

export interface PriceSearchCriteria {
  description?: string
  tradeCategory?: string
  workType?: string
  unit?: string
  region?: string
  minQuantity?: number
  maxQuantity?: number
  dateFrom?: string
  dateTo?: string
}

export interface MarketPriceData {
  id: string
  description: string
  unitPrice: number
  unit: string
  tradeCategory: string
  workType: string
  confidence: number
  sourceCount: number
  priceRange: {
    min: number
    max: number
    avg: number
  }
  lastUpdated: string
  region?: string
}

export async function searchMarketPrices(criteria: PriceSearchCriteria): Promise<MarketPriceData[]> {
  const supabase = createSupabaseClient()

  try {
    // Search in existing pricebook items
    let pricebookQuery = supabase.from("pricebook_items").select("*").eq("is_active", true)

    if (criteria.tradeCategory) {
      pricebookQuery = pricebookQuery.eq("branch", criteria.tradeCategory)
    }

    if (criteria.description) {
      pricebookQuery = pricebookQuery.ilike("title", `%${criteria.description}%`)
    }

    if (criteria.unit) {
      pricebookQuery = pricebookQuery.eq("unit", criteria.unit)
    }

    const { data: pricebookItems } = await pricebookQuery.limit(50)

    // Search in extracted prices from analyzed offers
    let extractedQuery = supabase
      .from("extracted_prices")
      .select(`
        *,
        uploaded_offers!inner(analysis_status, offer_date, metadata)
      `)
      .eq("uploaded_offers.analysis_status", "completed")
      .gte("confidence_score", 0.7) // Only high-confidence extractions

    if (criteria.tradeCategory) {
      extractedQuery = extractedQuery.eq("trade_category", criteria.tradeCategory)
    }

    if (criteria.description) {
      extractedQuery = extractedQuery.ilike("description", `%${criteria.description}%`)
    }

    if (criteria.unit) {
      extractedQuery = extractedQuery.eq("unit", criteria.unit)
    }

    if (criteria.dateFrom) {
      extractedQuery = extractedQuery.gte("uploaded_offers.offer_date", criteria.dateFrom)
    }

    if (criteria.dateTo) {
      extractedQuery = extractedQuery.lte("uploaded_offers.offer_date", criteria.dateTo)
    }

    const { data: extractedPrices } = await extractedQuery.limit(100)

    // Combine and aggregate results
    const marketPrices = aggregatePriceData(pricebookItems || [], extractedPrices || [])

    console.log("[v0] Found", marketPrices.length, "market prices for criteria:", criteria)
    return marketPrices
  } catch (error) {
    console.error("[v0] Market price search failed:", error)
    return []
  }
}

function aggregatePriceData(pricebookItems: any[], extractedPrices: any[]): MarketPriceData[] {
  const priceMap = new Map<
    string,
    {
      prices: number[]
      descriptions: Set<string>
      units: Set<string>
      tradeCategories: Set<string>
      workTypes: Set<string>
      regions: Set<string>
      lastUpdated: string
    }
  >()

  // Process pricebook items
  pricebookItems.forEach((item) => {
    const key = `${item.title}_${item.unit}_${item.branch}`.toLowerCase()
    const basePrice = (item.base_material_cost || 0) + ((item.base_minutes || 0) * 65) / 60 // Assume 65 EUR/hour

    if (!priceMap.has(key)) {
      priceMap.set(key, {
        prices: [],
        descriptions: new Set(),
        units: new Set(),
        tradeCategories: new Set(),
        workTypes: new Set(),
        regions: new Set(),
        lastUpdated: item.updated_at || item.created_at,
      })
    }

    const entry = priceMap.get(key)!
    entry.prices.push(basePrice)
    entry.descriptions.add(item.title)
    entry.units.add(item.unit)
    entry.tradeCategories.add(item.branch)
    entry.workTypes.add("Standard")
  })

  // Process extracted prices
  extractedPrices.forEach((price) => {
    const key = `${price.description}_${price.unit}_${price.trade_category}`.toLowerCase()

    if (!priceMap.has(key)) {
      priceMap.set(key, {
        prices: [],
        descriptions: new Set(),
        units: new Set(),
        tradeCategories: new Set(),
        workTypes: new Set(),
        regions: new Set(),
        lastUpdated: price.created_at,
      })
    }

    const entry = priceMap.get(key)!
    entry.prices.push(price.unit_price)
    entry.descriptions.add(price.description)
    entry.units.add(price.unit)
    entry.tradeCategories.add(price.trade_category)
    entry.workTypes.add(price.work_type)

    // Extract region from metadata if available
    if (price.uploaded_offers?.metadata?.region) {
      entry.regions.add(price.uploaded_offers.metadata.region)
    }
  })

  // Convert to MarketPriceData array
  return Array.from(priceMap.entries())
    .map(([key, data]) => {
      const prices = data.prices.filter((p) => p > 0)
      const min = Math.min(...prices)
      const max = Math.max(...prices)
      const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length

      return {
        id: key,
        description: Array.from(data.descriptions)[0],
        unitPrice: avg,
        unit: Array.from(data.units)[0],
        tradeCategory: Array.from(data.tradeCategories)[0],
        workType: Array.from(data.workTypes)[0],
        confidence: Math.min(0.95, 0.5 + prices.length * 0.1), // Higher confidence with more data points
        sourceCount: prices.length,
        priceRange: { min, max, avg },
        lastUpdated: data.lastUpdated,
        region: Array.from(data.regions)[0],
      }
    })
    .sort((a, b) => b.confidence - a.confidence)
}

export async function updatePricebookFromExtractedPrices(
  extractedPrices: OfferPosition[],
  offerId: string,
): Promise<void> {
  const supabase = createSupabaseClient()

  try {
    console.log("[v0] Updating pricebook with", extractedPrices.length, "extracted prices")

    for (const position of extractedPrices) {
      // Check if similar item exists in pricebook
      const { data: existingItems } = await supabase
        .from("pricebook_items")
        .select("*")
        .ilike("title", `%${position.description.substring(0, 20)}%`)
        .eq("unit", position.unit)
        .eq("branch", position.tradeCategory)
        .limit(1)

      if (existingItems && existingItems.length > 0) {
        // Update existing item with new price data
        const existingItem = existingItems[0]
        const currentPrice = (existingItem.base_material_cost || 0) + ((existingItem.base_minutes || 0) * 65) / 60

        // Create price update entry for approval
        await supabase.from("price_updates").insert({
          pricebook_item_id: existingItem.id,
          extracted_price_id: null, // Will be set after extracted_prices insert
          update_type: "price_update",
          old_price: currentPrice,
          new_price: position.unitPrice,
          price_change_pct: ((position.unitPrice - currentPrice) / currentPrice) * 100,
          status: "pending",
        })

        console.log("[v0] Created price update for existing item:", existingItem.title)
      } else {
        // Create new pricebook item
        const newItem = {
          title: position.description,
          code: `AUTO_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          unit: position.unit,
          branch: position.tradeCategory,
          base_material_cost: position.category === "material" ? position.unitPrice : 0,
          base_minutes: position.category === "labor" ? (position.unitPrice / 65) * 60 : 0, // Assume 65 EUR/hour
          markup_material_pct: 20, // Default markup
          overhead_pct: 15, // Default overhead
          region_factor: 1.0,
          is_active: false, // Requires approval
          variant_group: position.workType,
        }

        const { data: createdItem } = await supabase.from("pricebook_items").insert(newItem).select().single()

        if (createdItem) {
          // Create price update entry for new item approval
          await supabase.from("price_updates").insert({
            pricebook_item_id: createdItem.id,
            update_type: "new_item",
            new_price: position.unitPrice,
            status: "pending",
          })

          console.log("[v0] Created new pricebook item:", position.description)
        }
      }
    }

    console.log("[v0] Pricebook update completed")
  } catch (error) {
    console.error("[v0] Pricebook update failed:", error)
    throw error
  }
}

export async function getPricingRecommendations(
  projectType: string,
  tradeCategory: string,
  positions: Array<{
    description: string
    unit: string
    quantity: number
  }>,
): Promise<
  Array<{
    position: any
    recommendedPrice: number
    priceRange: { min: number; max: number; avg: number }
    confidence: number
    sources: string[]
    marketTrend: "above" | "at" | "below"
  }>
> {
  const recommendations = []

  for (const position of positions) {
    try {
      // Search for similar prices
      const marketPrices = await searchMarketPrices({
        description: position.description,
        tradeCategory,
        unit: position.unit,
      })

      if (marketPrices.length > 0) {
        const bestMatch = marketPrices[0]
        const recommendedPrice = bestMatch.unitPrice * (bestMatch.confidence > 0.8 ? 1.0 : 1.1) // Add safety margin for low confidence

        recommendations.push({
          position,
          recommendedPrice,
          priceRange: bestMatch.priceRange,
          confidence: bestMatch.confidence,
          sources: [`${bestMatch.sourceCount} Angebote`],
          marketTrend: "at" as const,
        })
      } else {
        // No market data found, use fallback pricing
        recommendations.push({
          position,
          recommendedPrice: 0,
          priceRange: { min: 0, max: 0, avg: 0 },
          confidence: 0,
          sources: ["Keine Marktdaten verfügbar"],
          marketTrend: "at" as const,
        })
      }
    } catch (error) {
      console.error("[v0] Failed to get recommendation for position:", position.description, error)
    }
  }

  return recommendations
}

export async function getPriceDatabaseStats() {
  const supabase = createSupabaseClient()

  try {
    // Count uploaded offers
    const { count: totalOffers } = await supabase.from("uploaded_offers").select("*", { count: "exact", head: true })

    const { count: analyzedOffers } = await supabase
      .from("uploaded_offers")
      .select("*", { count: "exact", head: true })
      .eq("analysis_status", "completed")

    // Count extracted prices
    const { count: extractedPrices } = await supabase
      .from("extracted_prices")
      .select("*", { count: "exact", head: true })

    // Count pricebook items
    const { count: pricebookItems } = await supabase
      .from("pricebook_items")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)

    // Count pending price updates
    const { count: pendingUpdates } = await supabase
      .from("price_updates")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")

    // Get total value of analyzed offers
    const { data: offerValues } = await supabase
      .from("uploaded_offers")
      .select("total_amount")
      .not("total_amount", "is", null)

    const totalValue = offerValues?.reduce((sum, offer) => sum + (offer.total_amount || 0), 0) || 0

    return {
      totalOffers: totalOffers || 0,
      analyzedOffers: analyzedOffers || 0,
      extractedPrices: extractedPrices || 0,
      pricebookItems: pricebookItems || 0,
      pendingUpdates: pendingUpdates || 0,
      totalValue,
      analysisRate: totalOffers ? Math.round((analyzedOffers / totalOffers) * 100) : 0,
    }
  } catch (error) {
    console.error("[v0] Failed to get price database stats:", error)
    return {
      totalOffers: 0,
      analyzedOffers: 0,
      extractedPrices: 0,
      pricebookItems: 0,
      pendingUpdates: 0,
      totalValue: 0,
      analysisRate: 0,
    }
  }
}
