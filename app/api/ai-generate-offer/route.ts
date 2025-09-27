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
    const { analysisResult, customerMessage } = await request.json()

    const supabase = createClient()
    const { data: pricingData } = await supabase.from("pricebook_items").select("*").eq("is_active", true).limit(50)

    const offerPrompt = `
Du bist ein erfahrener Angebotsspezialist für deutsche Handwerksbetriebe.
Erstelle basierend auf der KI-Analyse ein vollständiges, professionelles Angebot.

ANALYSE-ERGEBNIS:
Projekttyp: ${analysisResult.projectType}
Geschätzter Wert: €${analysisResult.estimatedValue}
Komplexität: ${analysisResult.complexity}
Hauptanforderungen: ${analysisResult.keyRequirements.join(", ")}

URSPRÜNGLICHE KUNDENANFRAGE:
${customerMessage}

VERFÜGBARE PREISBUCH-DATEN:
${
  pricingData
    ?.slice(0, 20)
    .map((item) => `${item.code}: ${item.title} - ${item.base_minutes}min, €${item.base_material_cost} Material`)
    .join("\n") || "Keine Preisdaten verfügbar"
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
`

    const result = await generateObject({
      model: "openai/gpt-4o",
      schema: GeneratedOfferSchema,
      prompt: offerPrompt,
      maxOutputTokens: 3000,
    })

    const offer = result.object
    offer.positions = offer.positions.map((pos, index) => ({
      ...pos,
      id: `pos_${Date.now()}_${index}`,
      totalPrice: pos.quantity * pos.unitPrice,
    }))

    offer.subtotal = offer.positions.reduce((sum, pos) => sum + pos.totalPrice, 0)
    offer.total = offer.subtotal * (1 + offer.riskPercent / 100)

    return NextResponse.json(offer)
  } catch (error) {
    console.error("[v0] Offer generation error:", error)
    return NextResponse.json({ error: "Fehler bei der Angebotserstellung" }, { status: 500 })
  }
}
