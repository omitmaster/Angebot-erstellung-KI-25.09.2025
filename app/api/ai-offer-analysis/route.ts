import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"

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
    const formData = await request.formData()
    const message = formData.get("message") as string

    const files: string[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("file_") && value instanceof File) {
        files.push(`${value.name} (${value.type}, ${Math.round(value.size / 1024)}KB)`)
      }
    }

    const analysisPrompt = `
Du bist ein erfahrener Bauexperte und Kalkulationsspezialist für deutsche Handwerksbetriebe. 
Analysiere die folgende Kundenanfrage und erstelle eine detaillierte Projektbewertung.

KUNDENANFRAGE:
${message}

${files.length > 0 ? `HOCHGELADENE DATEIEN:\n${files.join("\n")}` : ""}

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
`

    const result = await generateObject({
      model: "openai/gpt-4o",
      schema: AnalysisResultSchema,
      prompt: analysisPrompt,
      maxOutputTokens: 2000,
    })

    return NextResponse.json(result.object)
  } catch (error) {
    console.error("[v0] AI analysis error:", error)
    return NextResponse.json({ error: "Fehler bei der KI-Analyse" }, { status: 500 })
  }
}
