import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

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
    try {
      const supabase = await createClient()
      const { data, error: supabaseError } = await supabase
        .from("pricebook_items")
        .select("*")
        .eq("is_active", true)
        .limit(50)

      if (supabaseError) {
        console.error("[v0] AI Generate Offer API: Supabase error:", supabaseError)
        // Continue without pricing data rather than failing
        console.log("[v0] AI Generate Offer API: Continuing without pricing data")
      } else {
        pricingData = data || []
        console.log(`[v0] AI Generate Offer API: Retrieved ${pricingData.length} pricing items`)
      }
    } catch (dbError) {
      console.error("[v0] AI Generate Offer API: Database connection failed:", dbError)
      // Continue without pricing data
      console.log("[v0] AI Generate Offer API: Continuing without pricing data due to DB error")
    }

    const offerPrompt = `
Du bist ein erfahrener Angebotsspezialist für deutsche Handwerksbetriebe.
Erstelle basierend auf der KI-Analyse ein vollständiges, professionelles Angebot.

ANALYSE-ERGEBNIS:
Projekttyp: ${analysisResult.projectType}
Geschätzter Wert: €${analysisResult.estimatedValue || "Nicht angegeben"}
Komplexität: ${analysisResult.complexity}
Hauptanforderungen: ${analysisResult.keyRequirements?.join(", ") || "Keine spezifischen Anforderungen"}

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

ANGEBOTS-ANFORDERUNGEN:
- Erstelle einen aussagekräftigen Projekttitel
- Extrahiere/schätze Kundendaten aus der Anfrage
- Verwende realistische deutsche Handwerkerpreise (2024/2025)
- Kalkuliere mit Stundensatz von 80-90€
- Materialaufschlag 20-30%
- Risikozuschlag 10-20% je nach Komplexität
- Verwende deutsche Positionscodes (01.001, 02.001, etc.)
- Kategorien: Gerüstarbeiten, Vorarbeiten, Dämmarbeiten, Putzarbeiten, Malerarbeiten, etc.

TEXTBAUSTEINE:
- Einleitung: Professionelle Begrüßung und Projektbezug
- Vorteile: Warum der Kunde uns wählen sollte
- Ablauf: Wie das Projekt durchgeführt wird
- Bedingungen: Zahlungsbedingungen, Gewährleistung, etc.

Erstelle ein vollständiges, marktübliches Angebot mit allen notwendigen Positionen.
Achte auf deutsche Rechtschreibung und professionelle Formulierungen.
Stelle sicher, dass alle Positionen realistische Preise haben.
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
      offer.positions = offer.positions.map((pos, index) => ({
        ...pos,
        id: `pos_${Date.now()}_${index}`,
        totalPrice: Math.round(pos.quantity * pos.unitPrice * 100) / 100, // Round to 2 decimals
      }))

      offer.subtotal = Math.round(offer.positions.reduce((sum, pos) => sum + pos.totalPrice, 0) * 100) / 100
      offer.total = Math.round(offer.subtotal * (1 + (offer.riskPercent || 15) / 100) * 100) / 100

      console.log(
        `[v0] AI Generate Offer API: Offer processed successfully - ${offer.positions.length} positions, €${offer.total} total`,
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
