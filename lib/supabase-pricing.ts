// Supabase-Integration für die Preisdatenbank
// Verbindet die KI-Services mit der Datenbank

import { createClient } from "@/lib/supabase/server"
import type { PDFAnalysisResult, PricingSearchCriteria, PricingAnalysisResult } from "./ai-pricing-service"

function createSupabaseClient() {
  return createClient()
}

// PDF-Upload und Speicherung in der Datenbank
export async function savePDFAnalysis(
  filename: string,
  fileUrl: string,
  fileSizeBytes: number,
  analysisResult: PDFAnalysisResult,
  uploadedBy: string,
) {
  const supabase = createSupabaseClient()

  // Extrahiere Keywords für die Suche
  const searchKeywords = extractSearchKeywords(analysisResult)
  const branchTags = extractBranchTags(analysisResult)

  const { data, error } = await supabase
    .from("offer_history_pdfs")
    .insert({
      filename,
      file_url: fileUrl,
      file_size_bytes: fileSizeBytes,
      customer_name: analysisResult.metadata.customerName,
      project_type: analysisResult.metadata.projectType,
      total_amount: analysisResult.metadata.totalAmount,
      offer_date: analysisResult.metadata.offerDate,
      extracted_positions: analysisResult.extractedPositions,
      ai_analysis_status: "completed",
      ai_analysis_result: analysisResult,
      search_keywords: searchKeywords,
      branch_tags: branchTags,
      created_by: uploadedBy,
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving PDF analysis:", error)
    throw new Error(`Failed to save PDF analysis: ${error.message}`)
  }

  return data
}

// Suche nach ähnlichen Preisen in der Datenbank
export async function searchPricesInDatabase(criteria: PricingSearchCriteria) {
  const supabase = createSupabaseClient()

  // Erstelle Suchquery basierend auf Kriterien
  let query = supabase
    .from("offer_history_pdfs")
    .select(`
      id,
      filename,
      customer_name,
      project_type,
      total_amount,
      offer_date,
      extracted_positions,
      ai_analysis_result,
      branch_tags
    `)
    .eq("ai_analysis_status", "completed")

  // Filter nach Gewerk
  if (criteria.branch && criteria.branch !== "all") {
    query = query.contains("branch_tags", [criteria.branch])
  }

  // Textsuche in Keywords
  if (criteria.description) {
    const searchTerms = criteria.description.toLowerCase().split(" ")
    query = query.or(searchTerms.map((term) => `search_keywords.cs.{${term}}`).join(","))
  }

  const { data, error } = await query.limit(20)

  if (error) {
    console.error("Error searching prices:", error)
    return []
  }

  return data || []
}

// Cache-Management
export async function getCachedPricingFromDB(searchHash: string) {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase.from("ai_pricing_cache").select("*").eq("search_hash", searchHash).single()

  if (error || !data) {
    return null
  }

  // Update hit count und last_used
  await supabase
    .from("ai_pricing_cache")
    .update({
      hit_count: data.hit_count + 1,
      last_used: new Date().toISOString(),
    })
    .eq("id", data.id)

  return data.found_prices
}

export async function cachePricingInDB(
  searchHash: string,
  criteria: PricingSearchCriteria,
  result: PricingAnalysisResult,
) {
  const supabase = createSupabaseClient()

  const { error } = await supabase.from("ai_pricing_cache").upsert({
    search_hash: searchHash,
    search_criteria: criteria,
    found_prices: result.foundPrices,
    confidence_score: result.recommendedPrice.confidence,
    source_pdfs: result.foundPrices.map((p) => p.sourceOffer.id),
  })

  if (error) {
    console.error("Error caching pricing result:", error)
  }
}

// Hilfsfunktionen
function extractSearchKeywords(analysisResult: PDFAnalysisResult): string[] {
  const keywords = new Set<string>()

  // Keywords aus Metadaten
  if (analysisResult.metadata.projectType) {
    keywords.add(analysisResult.metadata.projectType.toLowerCase())
  }

  // Keywords aus Positionen
  analysisResult.extractedPositions.forEach((position) => {
    const words = position.description
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3)
    words.forEach((word) => keywords.add(word))
  })

  return Array.from(keywords)
}

function extractBranchTags(analysisResult: PDFAnalysisResult): string[] {
  const tags = new Set<string>()

  // Branch aus Metadaten
  if (analysisResult.metadata.branch) {
    tags.add(analysisResult.metadata.branch)
  }

  // Automatische Erkennung basierend auf Beschreibungen
  analysisResult.extractedPositions.forEach((position) => {
    const desc = position.description.toLowerCase()

    if (desc.includes("sanitär") || desc.includes("bad") || desc.includes("wc")) {
      tags.add("Sanitär")
    }
    if (desc.includes("elektro") || desc.includes("steckdose") || desc.includes("licht")) {
      tags.add("Elektro")
    }
    if (desc.includes("fliesen") || desc.includes("boden")) {
      tags.add("Fliesen")
    }
    if (desc.includes("maler") || desc.includes("streichen")) {
      tags.add("Maler")
    }
    if (desc.includes("dach") || desc.includes("ziegel")) {
      tags.add("Dach")
    }
  })

  return Array.from(tags)
}

// Statistiken für Dashboard
export async function getPricingStatistics() {
  const supabase = createSupabaseClient()

  const { data: totalPDFs } = await supabase.from("offer_history_pdfs").select("id", { count: "exact" })

  const { data: analyzedPDFs } = await supabase
    .from("offer_history_pdfs")
    .select("id", { count: "exact" })
    .eq("ai_analysis_status", "completed")

  const { data: totalValue } = await supabase
    .from("offer_history_pdfs")
    .select("total_amount")
    .not("total_amount", "is", null)

  const { data: cacheStats } = await supabase.from("ai_pricing_cache").select("hit_count", { count: "exact" })

  const totalAmount = totalValue?.reduce((sum, item) => sum + (item.total_amount || 0), 0) || 0
  const avgAmount = totalValue?.length ? totalAmount / totalValue.length : 0

  return {
    totalPDFs: totalPDFs?.length || 0,
    analyzedPDFs: analyzedPDFs?.length || 0,
    totalValue: totalAmount,
    averageValue: avgAmount,
    cacheHits: cacheStats?.reduce((sum, item) => sum + item.hit_count, 0) || 0,
  }
}
