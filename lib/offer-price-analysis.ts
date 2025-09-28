import { generateText } from "ai"

export interface OfferPosition {
  positionNumber: string
  description: string
  unit: string
  quantity: number
  unitPrice: number
  totalPrice: number
  category: "labor" | "material" | "equipment" | "other"
  tradeCategory: string
  workType: string
  confidence: number
}

export interface PriceAnalysisResult {
  totalPositions: number
  analyzedPositions: number
  matchedPositions: number
  newPositions: number
  averageMarkupPct: number
  competitiveScore: number
  priceTrend: "above_market" | "at_market" | "below_market"
  recommendations: string[]
  priceAdjustments: Array<{
    positionId: string
    currentPrice: number
    suggestedPrice: number
    reason: string
  }>
  dataQualityScore: number
  completenessPct: number
}

export interface ExtractedOfferData {
  offerTitle: string
  offerDate: string
  customerName: string
  projectType: string
  totalAmount: number
  currency: string
  positions: OfferPosition[]
  metadata: {
    region?: string
    tradeType?: string
    projectSize?: string
    complexity?: "low" | "medium" | "high"
  }
}

// Main function to analyze uploaded offer files
export async function analyzeOfferFile(
  fileUrl: string,
  fileName: string,
  fileType: string,
): Promise<ExtractedOfferData> {
  console.log("[v0] Starting offer analysis for:", fileName)

  try {
    // Extract text content from file based on type
    const textContent = await extractTextFromFile(fileUrl, fileType)

    // Use AI to analyze and extract structured data
    const analysisPrompt = `
Analysiere das folgende Angebot und extrahiere strukturierte Daten:

DATEI: ${fileName}
INHALT: ${textContent}

Extrahiere folgende Informationen:
1. Angebots-Titel und Datum
2. Kundenname und Projekttyp
3. Alle Positionen mit Beschreibung, Menge, Einheit, Einzelpreis und Gesamtpreis
4. Kategorisierung jeder Position (Arbeit/Material/Gerät/Sonstiges)
5. Handwerkssparte (Elektrik, Sanitär, Bau, etc.)
6. Arbeitstyp (Installation, Reparatur, Wartung, etc.)
7. Gesamtsumme und Währung

Gib die Daten als JSON zurück mit folgender Struktur:
{
  "offerTitle": "string",
  "offerDate": "YYYY-MM-DD",
  "customerName": "string", 
  "projectType": "string",
  "totalAmount": number,
  "currency": "EUR",
  "positions": [
    {
      "positionNumber": "string",
      "description": "string",
      "unit": "string",
      "quantity": number,
      "unitPrice": number,
      "totalPrice": number,
      "category": "labor|material|equipment|other",
      "tradeCategory": "string",
      "workType": "string",
      "confidence": number
    }
  ],
  "metadata": {
    "region": "string",
    "tradeType": "string",
    "projectSize": "string",
    "complexity": "low|medium|high"
  }
}
`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt: analysisPrompt,
      maxTokens: 4000,
    })

    // Parse AI response
    const extractedData = parseAIResponse(text)
    console.log("[v0] Successfully extracted offer data:", extractedData.positions.length, "positions")

    return extractedData
  } catch (error) {
    console.error("[v0] Offer analysis failed:", error)
    throw new Error(`Offer analysis failed: ${error}`)
  }
}

// Analyze extracted prices against market data
export async function analyzePrices(
  extractedData: ExtractedOfferData,
  marketPrices: any[],
): Promise<PriceAnalysisResult> {
  console.log("[v0] Starting price analysis for", extractedData.positions.length, "positions")

  const analysisPrompt = `
Analysiere die folgenden Angebotspositionen gegen Marktpreise:

ANGEBOTSDATEN:
${JSON.stringify(extractedData, null, 2)}

MARKTPREISE:
${JSON.stringify(marketPrices, null, 2)}

Führe eine detaillierte Preisanalyse durch:
1. Vergleiche jede Position mit ähnlichen Marktpreisen
2. Berechne Abweichungen und Markup-Prozentsätze
3. Bewerte die Wettbewerbsfähigkeit (0.0-1.0)
4. Identifiziere Preisanpassungsempfehlungen
5. Bewerte die Datenqualität und Vollständigkeit

Gib das Ergebnis als JSON zurück:
{
  "totalPositions": number,
  "analyzedPositions": number,
  "matchedPositions": number,
  "newPositions": number,
  "averageMarkupPct": number,
  "competitiveScore": number,
  "priceTrend": "above_market|at_market|below_market",
  "recommendations": ["string"],
  "priceAdjustments": [
    {
      "positionId": "string",
      "currentPrice": number,
      "suggestedPrice": number,
      "reason": "string"
    }
  ],
  "dataQualityScore": number,
  "completenessPct": number
}
`

  try {
    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt: analysisPrompt,
      maxTokens: 3000,
    })

    const analysisResult = JSON.parse(text) as PriceAnalysisResult
    console.log("[v0] Price analysis completed with score:", analysisResult.competitiveScore)

    return analysisResult
  } catch (error) {
    console.error("[v0] Price analysis failed:", error)
    throw new Error(`Price analysis failed: ${error}`)
  }
}

// Extract text content from different file types
async function extractTextFromFile(fileUrl: string, fileType: string): Promise<string> {
  try {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return await extractTextFromPDF(fileUrl)
      case "xlsx":
      case "xls":
        return await extractTextFromExcel(fileUrl)
      case "x80":
      case "x81":
      case "x82":
      case "x83":
      case "x84":
        return await extractTextFromGAEB(fileUrl)
      default:
        throw new Error(`Unsupported file type: ${fileType}`)
    }
  } catch (error) {
    console.error("[v0] Text extraction failed:", error)
    throw error
  }
}

// Mock PDF text extraction - in production use pdf-parse or similar
async function extractTextFromPDF(fileUrl: string): Promise<string> {
  // This would use a PDF parsing library in production
  console.log("[v0] Extracting text from PDF:", fileUrl)

  // Mock extracted content for demonstration
  return `
ANGEBOT Nr. 2024-001
Datum: 15.01.2024
Kunde: Max Mustermann GmbH
Projekt: Elektroinstallation Neubau

Pos. 1: Steckdosen setzen, 20 Stk, 45,00 EUR/Stk = 900,00 EUR
Pos. 2: Lichtschalter montieren, 15 Stk, 35,00 EUR/Stk = 525,00 EUR  
Pos. 3: Kabel verlegen, 200 m, 8,50 EUR/m = 1.700,00 EUR
Pos. 4: Sicherungskasten installieren, 1 Stk, 850,00 EUR/Stk = 850,00 EUR
Pos. 5: Arbeitszeit Elektriker, 40 h, 65,00 EUR/h = 2.600,00 EUR

Gesamtsumme netto: 6.575,00 EUR
MwSt. 19%: 1.249,25 EUR
Gesamtsumme brutto: 7.824,25 EUR
  `
}

// Mock Excel text extraction
async function extractTextFromExcel(fileUrl: string): Promise<string> {
  console.log("[v0] Extracting text from Excel:", fileUrl)

  // Mock extracted content
  return `
Kostenvoranschlag Sanitär
Kunde: Anna Schmidt
Projekt: Badezimmer Renovierung

Position | Beschreibung | Menge | Einheit | Einzelpreis | Gesamtpreis
1 | Fliesen entfernen | 25 | m² | 15,00 | 375,00
2 | Neue Fliesen verlegen | 25 | m² | 45,00 | 1.125,00
3 | WC austauschen | 1 | Stk | 350,00 | 350,00
4 | Waschtisch montieren | 1 | Stk | 280,00 | 280,00
5 | Duschkabine einbauen | 1 | Stk | 1.200,00 | 1.200,00

Summe: 3.330,00 EUR
  `
}

// Mock GAEB text extraction
async function extractTextFromGAEB(fileUrl: string): Promise<string> {
  console.log("[v0] Extracting text from GAEB:", fileUrl)

  // Mock extracted content
  return `
GAEB LV-Datei
Projekt: Neubau Einfamilienhaus
Gewerk: Rohbau

01.001 Erdarbeiten, Aushub, 150 m³, 12,50 EUR/m³ = 1.875,00 EUR
01.002 Fundament betonieren, 45 m³, 85,00 EUR/m³ = 3.825,00 EUR
01.003 Mauerwerk errichten, 180 m², 35,00 EUR/m² = 6.300,00 EUR
01.004 Decke betonieren, 120 m², 55,00 EUR/m² = 6.600,00 EUR

Gesamtsumme: 18.600,00 EUR
  `
}

// Parse AI response and validate structure
function parseAIResponse(aiResponse: string): ExtractedOfferData {
  try {
    // Clean response and extract JSON
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response")
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Validate required fields
    if (!parsed.positions || !Array.isArray(parsed.positions)) {
      throw new Error("Invalid positions data")
    }

    // Set default values for missing fields
    return {
      offerTitle: parsed.offerTitle || "Unbekanntes Angebot",
      offerDate: parsed.offerDate || new Date().toISOString().split("T")[0],
      customerName: parsed.customerName || "Unbekannter Kunde",
      projectType: parsed.projectType || "Allgemeines Projekt",
      totalAmount: parsed.totalAmount || 0,
      currency: parsed.currency || "EUR",
      positions: parsed.positions.map((pos: any, index: number) => ({
        positionNumber: pos.positionNumber || `${index + 1}`,
        description: pos.description || "Keine Beschreibung",
        unit: pos.unit || "Stk",
        quantity: pos.quantity || 1,
        unitPrice: pos.unitPrice || 0,
        totalPrice: pos.totalPrice || 0,
        category: pos.category || "other",
        tradeCategory: pos.tradeCategory || "Allgemein",
        workType: pos.workType || "Sonstiges",
        confidence: pos.confidence || 0.7,
      })),
      metadata: {
        region: parsed.metadata?.region,
        tradeType: parsed.metadata?.tradeType,
        projectSize: parsed.metadata?.projectSize,
        complexity: parsed.metadata?.complexity || "medium",
      },
    }
  } catch (error) {
    console.error("[v0] Failed to parse AI response:", error)
    throw new Error(`Failed to parse AI response: ${error}`)
  }
}

// Update pricebook with new price data
export async function updatePricebook(
  extractedPrices: OfferPosition[],
  analysisResult: PriceAnalysisResult,
): Promise<void> {
  console.log("[v0] Updating pricebook with", extractedPrices.length, "new prices")

  // This would integrate with the existing pricebook_items table
  // and create price_updates entries for approval workflow

  try {
    // Process each position for pricebook integration
    for (const position of extractedPrices) {
      // Check if similar item exists in pricebook
      // Create or update price entry
      // Log price changes for approval
      console.log("[v0] Processing position:", position.description)
    }

    console.log("[v0] Pricebook update completed")
  } catch (error) {
    console.error("[v0] Pricebook update failed:", error)
    throw error
  }
}
