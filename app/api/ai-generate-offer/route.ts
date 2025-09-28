import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { getPricingRecommendations } from "@/lib/price-database-integration"

const GeneratedOfferSchema = z.object({
  projectTitle: z.string(),
  customer: z.object({
    name: z.string(),
    address: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
  }),
  positions: z.array(
    z.object({
      id: z.string(),
      code: z.string(),
      title: z.string(),
      description: z.string(),
      quantity: z.number(),
      unit: z.string(),
      unitPrice: z.number(),
      totalPrice: z.number(),
      category: z.string(),
      marketData: z
        .object({
          confidence: z.number(),
          marketPrice: z.number(),
          priceVariance: z.number(),
          sources: z.array(z.string()),
        })
        .optional(),
    }),
  ),
  subtotal: z.number(),
  riskPercent: z.number(),
  total: z.number(),
  textBlocks: z.object({
    introduction: z.string(),
    advantages: z.string(),
    process: z.string(),
    terms: z.string(),
  }),
  marketAnalysis: z
    .object({
      positionsAnalyzed: z.number(),
      totalPositions: z.number(),
      averageConfidence: z.number(),
      dataQuality: z.string(),
    })
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] AI Generate Offer API: Starting request processing")

    const requestData = await request.json()
    const { analysisResult, customerMessage } = requestData

    // Validate input data
    if (!analysisResult || !customerMessage) {
      console.error("[v0] AI Generate Offer API: Missing required data")
      return NextResponse.json(
        {
          error: "Unvollständige Daten",
          details: "Analyse-Ergebnis und Kundennachricht sind erforderlich.",
        },
        { status: 400 },
      )
    }

    // Validate analysis result structure
    if (!analysisResult.projectType || !analysisResult.keyRequirements) {
      console.error("[v0] AI Generate Offer API: Invalid analysis result structure")
      return NextResponse.json(
        {
          error: "Ungültige Analysedaten",
          details: "Die Analyse-Ergebnisse sind unvollständig. Bitte führen Sie zuerst eine neue Analyse durch.",
        },
        { status: 422 },
      )
    }

    console.log(`[v0] AI Generate Offer API: Processing offer for project type: ${analysisResult.projectType}`)

    // Get pricing data from Supabase with error handling
    let pricingData: any[] = []
    let marketRecommendations: any[] = []

    try {
      const supabase = await createClient()

      // Get traditional pricebook items
      const { data, error: supabaseError } = await supabase
        .from("pricebook_items")
        .select("*")
        .eq("is_active", true)
        .limit(50)

      if (supabaseError) {
        console.error("[v0] AI Generate Offer API: Supabase error:", supabaseError)
      } else {
        pricingData = data || []
        console.log(`[v0] AI Generate Offer API: Retrieved ${pricingData.length} pricebook items`)
      }

      if (analysisResult.keyRequirements && analysisResult.projectType) {
        try {
          // Extract potential positions from requirements
          const estimatedPositions = analysisResult.keyRequirements.map((req: string, index: number) => ({
            description: req,
            unit: "Stk", // Default unit
            quantity: 1,
          }))

          marketRecommendations = await getPricingRecommendations(
            analysisResult.projectType,
            analysisResult.branch || "Allgemein",
            estimatedPositions,
          )

          console.log(`[v0] AI Generate Offer API: Retrieved ${marketRecommendations.length} market recommendations`)
        } catch (marketError) {
          console.error("[v0] AI Generate Offer API: Market pricing failed:", marketError)
          // Continue without market data
        }
      }
    } catch (dbError) {
      console.error("[v0] AI Generate Offer API: Database connection failed:", dbError)
    }

    const offerPrompt = `
Du bist ein erfahrener Angebotsspezialist für deutsche Handwerksbetriebe.
Erstelle basierend auf der KI-Analyse ein vollständiges, professionelles Angebot.

ANALYSE-ERGEBNIS:
Projekttyp: ${analysisResult.projectType}
Geschätzter Wert: €${analysisResult.estimatedValue || "Nicht angegeben"}
Komplexität: ${analysisResult.complexity}
Hauptanforderungen: ${analysisResult.keyRequirements?.join(", ") || "Keine spezifischen Anforderungen"}
Gewerk: ${analysisResult.branch || "Allgemein"}

URSPRÜNGLICHE KUNDENANFRAGE:
${customerMessage}

VERFÜGBARE PREISBUCH-DATEN:
${
  pricingData?.length > 0
    ? pricingData
        .slice(0, 20)
        .map((item) => `${item.code}: ${item.title} - ${item.base_minutes}min, €${item.base_material_cost} Material`)
        .join("\n")
    : "Keine Preisdaten verfügbar - verwende Marktpreise"
}

MARKTBASIERTE PREISEMPFEHLUNGEN:
${
  marketRecommendations?.length > 0
    ? marketRecommendations
        .filter((rec) => rec.recommendedPrice > 0)
        .map(
          (rec) =>
            `${rec.position.description}: €${rec.recommendedPrice}/${rec.position.unit} (Konfidenz: ${Math.round(rec.confidence * 100)}%, Quellen: ${rec.sources.join(", ")})`,
        )
        .join("\n")
    : "Keine Marktdaten verfügbar"
}

ANGEBOTS-ANFORDERUNGEN:
- Erstelle einen aussagekräftigen Projekttitel
- Extrahiere/schätze Kundendaten aus der Anfrage
- VERWENDE VORRANGIG DIE MARKTBASIERTEN PREISEMPFEHLUNGEN wenn verfügbar
- Fallback: Realistische deutsche Handwerkerpreise (2024/2025)
- Kalkuliere mit Stundensatz von 80-90€
- Materialaufschlag 20-30%
- Risikozuschlag 10-20% je nach Komplexität
- Verwende deutsche Positionscodes (01.001, 02.001, etc.)
- Kategorien: Gerüstarbeiten, Vorarbeiten, Dämmarbeiten, Putzarbeiten, Malerarbeiten, etc.

TEXTBAUSTEINE:
- Einleitung: Professionelle Begrüßung und Projektbezug
- Vorteile: Warum der Kunde uns wählen sollte (erwähne Erfahrung aus ${marketRecommendations.length > 0 ? "vielen ähnlichen Projekten" : "langjähriger Praxis"})
- Ablauf: Wie das Projekt durchgeführt wird
- Bedingungen: Zahlungsbedingungen, Gewährleistung, etc.

Erstelle ein vollständiges, marktübliches Angebot mit allen notwendigen Positionen.
Achte auf deutsche Rechtschreibung und professionelle Formulierungen.
Stelle sicher, dass alle Positionen realistische, marktbasierte Preise haben.
`

    // Generate offer with AI
    let result
    try {
      result = await generateObject({
        model: "openai/gpt-4o",
        schema: GeneratedOfferSchema,
        prompt: offerPrompt,
        maxOutputTokens: 3000,
        temperature: 0.1,
      })

      console.log("[v0] AI Generate Offer API: AI offer generation completed successfully")
    } catch (aiError) {
      console.error("[v0] AI Generate Offer API: AI offer generation failed:", aiError)

      // Provide specific error messages based on error type
      let errorMessage = "Angebotserstellung fehlgeschlagen"
      let errorDetails = "Bitte versuchen Sie es erneut"

      if (aiError instanceof Error) {
        if (aiError.message.includes("timeout")) {
          errorMessage = "Zeitüberschreitung bei der Angebotserstellung"
          errorDetails = "Das Projekt ist zu komplex. Versuchen Sie es mit weniger Positionen"
        } else if (aiError.message.includes("rate limit") || aiError.message.includes("quota")) {
          errorMessage = "Service temporär überlastet"
          errorDetails = "Bitte warten Sie einen Moment und versuchen Sie es erneut"
        } else if (aiError.message.includes("content")) {
          errorMessage = "Angebot konnte nicht erstellt werden"
          errorDetails = "Überprüfen Sie die Analyse-Ergebnisse und versuchen Sie es erneut"
        } else {
          errorDetails = aiError.message
        }
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorDetails,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    // Validate and process the generated offer
    const offer = result.object

    if (!offer.positions || offer.positions.length === 0) {
      console.error("[v0] AI Generate Offer API: No positions generated")
      return NextResponse.json(
        {
          error: "Unvollständiges Angebot",
          details:
            "Es konnten keine Angebotspositionen erstellt werden. Bitte geben Sie mehr Details zu Ihrem Projekt an.",
        },
        { status: 422 },
      )
    }

    // Process positions and calculate totals with error handling
    try {
      offer.positions = offer.positions.map((pos, index) => {
        const marketMatch = marketRecommendations.find((rec) =>
          rec.position.description.toLowerCase().includes(pos.title.toLowerCase().substring(0, 10)),
        )

        return {
          ...pos,
          id: `pos_${Date.now()}_${index}`,
          totalPrice: Math.round(pos.quantity * pos.unitPrice * 100) / 100,
          marketData: marketMatch
            ? {
                confidence: marketMatch.confidence,
                marketPrice: marketMatch.recommendedPrice,
                priceVariance:
                  marketMatch.recommendedPrice > 0
                    ? Math.round(((pos.unitPrice - marketMatch.recommendedPrice) / marketMatch.recommendedPrice) * 100)
                    : 0,
                sources: marketMatch.sources,
              }
            : null,
        }
      })

      offer.subtotal = Math.round(offer.positions.reduce((sum, pos) => sum + pos.totalPrice, 0) * 100) / 100
      offer.total = Math.round(offer.subtotal * (1 + (offer.riskPercent || 15) / 100) * 100) / 100

      const positionsWithMarketData = offer.positions.filter((pos) => pos.marketData)
      const avgConfidence =
        positionsWithMarketData.length > 0
          ? positionsWithMarketData.reduce((sum, pos) => sum + pos.marketData.confidence, 0) /
            positionsWithMarketData.length
          : 0

      offer.marketAnalysis = {
        positionsAnalyzed: positionsWithMarketData.length,
        totalPositions: offer.positions.length,
        averageConfidence: Math.round(avgConfidence * 100),
        dataQuality: avgConfidence > 0.8 ? "Hoch" : avgConfidence > 0.6 ? "Mittel" : "Niedrig",
      }

      console.log(
        `[v0] AI Generate Offer API: Offer processed successfully - ${offer.positions.length} positions, €${offer.total} total, ${positionsWithMarketData.length} with market data`,
      )
    } catch (calculationError) {
      console.error("[v0] AI Generate Offer API: Price calculation failed:", calculationError)
      return NextResponse.json(
        {
          error: "Preisberechnung fehlgeschlagen",
          details: "Die Angebotssummen konnten nicht korrekt berechnet werden.",
        },
        { status: 500 },
      )
    }

    const finalOffer = {
      ...offer,
      id: `offer_${Date.now()}`,
    }

    console.log("[v0] AI Generate Offer API: Offer generation completed successfully")
    return NextResponse.json(finalOffer)
  } catch (error) {
    console.error("[v0] AI Generate Offer API: Unexpected error:", error)

    // Provide user-friendly error messages
    let errorMessage = "Ein unerwarteter Fehler ist aufgetreten"
    let errorDetails = "Bitte versuchen Sie es erneut oder kontaktieren Sie den Support"

    if (error instanceof Error) {
      if (error.message.includes("JSON")) {
        errorMessage = "Datenformat-Fehler"
        errorDetails = "Die Anfrage konnte nicht verarbeitet werden. Bitte laden Sie die Seite neu"
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        errorMessage = "Netzwerkfehler"
        errorDetails = "Überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut"
      } else if (error.message.includes("memory") || error.message.includes("heap")) {
        errorMessage = "Angebot zu komplex"
        errorDetails = "Das Angebot ist zu umfangreich. Versuchen Sie es mit weniger Positionen"
      } else {
        errorDetails = error.message
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
