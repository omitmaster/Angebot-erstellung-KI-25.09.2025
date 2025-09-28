import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"
import { extractFileContent } from "@/lib/ai-offer-service"

const AnalysisResultSchema = z.object({
  projectType: z.string().describe('Art des Bauprojekts (z.B. "Energetische Sanierung Einfamilienhaus")'),
  estimatedValue: z.number().describe("Geschätzter Projektwert in Euro"),
  complexity: z.enum(["low", "medium", "high"]).describe("Komplexität des Projekts"),
  urgency: z.enum(["low", "medium", "high"]).describe("Dringlichkeit basierend auf Kundenwünschen"),
  keyRequirements: z.array(z.string()).describe("Hauptanforderungen des Kunden"),
  suggestedPositions: z
    .array(
      z.object({
        code: z.string().describe('Positionscode (z.B. "01.001")'),
        title: z.string().describe("Kurzer Titel der Position"),
        description: z.string().describe("Detaillierte Beschreibung"),
        quantity: z.number().describe("Geschätzte Menge"),
        unit: z.string().describe("Einheit (m², m³, Stk, etc.)"),
        estimatedPrice: z.number().describe("Geschätzter Gesamtpreis für diese Position"),
      }),
    )
    .describe("Vorgeschlagene Angebotspositionen"),
  riskFactors: z.array(z.string()).describe("Identifizierte Risikofaktoren"),
  recommendations: z.array(z.string()).describe("KI-Empfehlungen für das Projekt"),
})

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] AI Offer Analysis API: Starting request processing")

    const formData = await request.formData()
    const message = formData.get("message") as string

    // Validate message
    if (!message || message.trim().length < 10) {
      console.error("[v0] AI Offer Analysis API: Invalid or missing message")
      return NextResponse.json(
        {
          error: "Unvollständige Anfrage",
          details: "Bitte geben Sie eine detaillierte Beschreibung Ihres Projekts ein (mindestens 10 Zeichen).",
        },
        { status: 400 },
      )
    }

    // Process uploaded files with enhanced error handling
    const files: string[] = []
    const fileContents: string[] = []

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("file_") && value instanceof File) {
        try {
          // Validate file size (max 10MB)
          const maxSize = 10 * 1024 * 1024 // 10MB
          if (value.size > maxSize) {
            console.error(`[v0] AI Offer Analysis API: File too large: ${value.name} (${value.size} bytes)`)
            files.push(`${value.name} - FEHLER: Datei zu groß (max. 10MB)`)
            continue
          }

          // Extract file content
          const content = await extractFileContent(value)
          files.push(`${value.name} (${value.type}, ${Math.round(value.size / 1024)}KB)`)
          fileContents.push(`=== ${value.name} ===\n${content.substring(0, 2000)}${content.length > 2000 ? "..." : ""}`)

          console.log(`[v0] AI Offer Analysis API: Successfully processed file: ${value.name}`)
        } catch (fileError) {
          console.error(`[v0] AI Offer Analysis API: Failed to process file ${value.name}:`, fileError)
          files.push(`${value.name} - FEHLER: ${fileError instanceof Error ? fileError.message : "Unbekannter Fehler"}`)
        }
      }
    }

    console.log(`[v0] AI Offer Analysis API: Processing message (${message.length} chars) with ${files.length} files`)

    const analysisPrompt = `
Du bist ein erfahrener Bauexperte und Kalkulationsspezialist für deutsche Handwerksbetriebe. 
Analysiere die folgende Kundenanfrage und erstelle eine detaillierte Projektbewertung.

KUNDENANFRAGE:
${message}

${files.length > 0 ? `HOCHGELADENE DATEIEN:\n${files.join("\n")}` : ""}

${fileContents.length > 0 ? `\nDATEIINHALTE:\n${fileContents.join("\n\n")}` : ""}

ANALYSE-KONTEXT:
- Du arbeitest für einen deutschen Handwerksbetrieb
- Preise sollen marktüblich für Deutschland sein (2024/2025)
- Berücksichtige deutsche Baustandards und Vorschriften
- Kalkuliere mit üblichen Handwerkerpreisen (Stundensatz ca. 80-90€)
- Materialaufschläge von 20-30% sind normal
- Risikozuschläge von 10-20% je nach Komplexität

BEWERTUNGSKRITERIEN:
- Projekttyp: Identifiziere die Art des Bauprojekts
- Komplexität: Niedrig (Standardarbeiten), Mittel (mehrere Gewerke), Hoch (komplexe Koordination)
- Dringlichkeit: Basierend auf Kundenwünschen und Zeitangaben
- Risikofaktoren: Altbau, Denkmalschutz, schwierige Zugänglichkeit, etc.

POSITIONSVORSCHLÄGE:
- Verwende deutsche Positionscodes (01.001, 02.001, etc.)
- Kalkuliere realistische Mengen und Preise
- Berücksichtige alle notwendigen Arbeitsschritte
- Denke an Nebenleistungen (Gerüst, Entsorgung, etc.)

Erstelle eine professionelle Analyse mit konkreten, umsetzbaren Empfehlungen.
Nutze die Informationen aus den hochgeladenen Dateien für eine präzise Bewertung.
`

    // Generate AI analysis with timeout and retry logic
    let result
    try {
      result = await generateObject({
        model: "openai/gpt-4o",
        schema: AnalysisResultSchema,
        prompt: analysisPrompt,
        maxOutputTokens: 2000,
        temperature: 0.1,
      })

      console.log("[v0] AI Offer Analysis API: AI analysis completed successfully")
    } catch (aiError) {
      console.error("[v0] AI Offer Analysis API: AI analysis failed:", aiError)

      // Provide specific error messages based on error type
      let errorMessage = "KI-Analyse fehlgeschlagen"
      let errorDetails = "Bitte versuchen Sie es erneut"

      if (aiError instanceof Error) {
        if (aiError.message.includes("timeout")) {
          errorMessage = "Zeitüberschreitung bei der Analyse"
          errorDetails = "Die Anfrage war zu komplex. Versuchen Sie es mit einer kürzeren Beschreibung"
        } else if (aiError.message.includes("rate limit") || aiError.message.includes("quota")) {
          errorMessage = "Service temporär überlastet"
          errorDetails = "Bitte warten Sie einen Moment und versuchen Sie es erneut"
        } else if (aiError.message.includes("content")) {
          errorMessage = "Inhalt konnte nicht verarbeitet werden"
          errorDetails = "Überprüfen Sie Ihre Eingabe auf unzulässige Inhalte"
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

    // Validate AI response
    if (!result.object || !result.object.projectType) {
      console.error("[v0] AI Offer Analysis API: Invalid AI response")
      return NextResponse.json(
        {
          error: "Unvollständige Analyse",
          details:
            "Die KI konnte keine vollständige Analyse erstellen. Bitte geben Sie mehr Details zu Ihrem Projekt an.",
        },
        { status: 422 },
      )
    }

    console.log("[v0] AI Offer Analysis API: Analysis completed successfully")
    return NextResponse.json(result.object)
  } catch (error) {
    console.error("[v0] AI Offer Analysis API: Unexpected error:", error)

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
