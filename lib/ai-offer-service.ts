import { generateObject } from "ai"
import { z } from "zod"

export interface CustomerRequest {
  message: string
  files: File[]
  urgency?: "low" | "medium" | "high"
  budget?: number
  timeline?: string
}

export interface OfferAnalysis {
  projectType: string
  estimatedValue: number
  complexity: "low" | "medium" | "high"
  urgency: "low" | "medium" | "high"
  keyRequirements: string[]
  suggestedPositions: Array<{
    code: string
    title: string
    description: string
    quantity: number
    unit: string
    estimatedPrice: number
  }>
  riskFactors: string[]
  recommendations: string[]
}

export interface GeneratedOffer {
  id: string
  projectTitle: string
  customer: {
    name: string
    address: string
    email?: string
    phone?: string
  }
  positions: Array<{
    id: string
    code: string
    title: string
    description: string
    quantity: number
    unit: string
    unitPrice: number
    totalPrice: number
    category: string
  }>
  subtotal: number
  riskPercent: number
  total: number
  textBlocks: {
    introduction: string
    advantages: string
    process: string
    terms: string
  }
}

const OfferAnalysisSchema = z.object({
  projectType: z.string(),
  estimatedValue: z.number(),
  complexity: z.enum(["low", "medium", "high"]),
  urgency: z.enum(["low", "medium", "high"]),
  keyRequirements: z.array(z.string()),
  suggestedPositions: z.array(
    z.object({
      code: z.string(),
      title: z.string(),
      description: z.string(),
      quantity: z.number(),
      unit: z.string(),
      estimatedPrice: z.number(),
    }),
  ),
  riskFactors: z.array(z.string()),
  recommendations: z.array(z.string()),
})

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

export async function analyzeCustomerRequest(request: CustomerRequest): Promise<OfferAnalysis> {
  const fileInfo = request.files.map((f) => `${f.name} (${f.type}, ${Math.round(f.size / 1024)}KB)`).join("\n")

  const prompt = `
Du bist ein erfahrener Bauexperte und Kalkulationsspezialist für deutsche Handwerksbetriebe.
Analysiere die folgende Kundenanfrage und erstelle eine detaillierte Projektbewertung.

KUNDENANFRAGE:
${request.message}

${fileInfo ? `HOCHGELADENE DATEIEN:\n${fileInfo}` : ""}

${request.budget ? `BUDGET: €${request.budget}` : ""}
${request.timeline ? `ZEITRAHMEN: ${request.timeline}` : ""}
${request.urgency ? `DRINGLICHKEIT: ${request.urgency}` : ""}

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
    schema: OfferAnalysisSchema,
    prompt,
    maxOutputTokens: 2000,
  })

  return result.object
}

export async function generateOfferFromAnalysis(
  analysis: OfferAnalysis,
  customerMessage: string,
  pricingData?: any[],
): Promise<GeneratedOffer> {
  const prompt = `
Du bist ein erfahrener Angebotsspezialist für deutsche Handwerksbetriebe.
Erstelle basierend auf der KI-Analyse ein vollständiges, professionelles Angebot.

ANALYSE-ERGEBNIS:
Projekttyp: ${analysis.projectType}
Geschätzter Wert: €${analysis.estimatedValue}
Komplexität: ${analysis.complexity}
Hauptanforderungen: ${analysis.keyRequirements.join(", ")}

URSPRÜNGLICHE KUNDENANFRAGE:
${customerMessage}

${
  pricingData
    ? `VERFÜGBARE PREISBUCH-DATEN:
${pricingData
  .slice(0, 20)
  .map((item) => `${item.code}: ${item.title} - ${item.base_minutes}min, €${item.base_material_cost} Material`)
  .join("\n")}`
    : ""
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
    prompt,
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

  return {
    ...offer,
    id: `offer_${Date.now()}`,
  }
}

export async function extractFileContent(file: File): Promise<string> {
  try {
    if (file.type === "text/plain") {
      return await file.text()
    }

    if (file.type === "application/pdf") {
      // In production, use a PDF parsing library like pdf-parse
      return `PDF-Datei: ${file.name} (${Math.round(file.size / 1024)}KB)`
    }

    if (file.type.startsWith("image/")) {
      return `Bild-Datei: ${file.name} (${Math.round(file.size / 1024)}KB)`
    }

    return `Datei: ${file.name} (${file.type}, ${Math.round(file.size / 1024)}KB)`
  } catch (error) {
    console.error("Error extracting file content:", error)
    return `Fehler beim Lesen der Datei: ${file.name}`
  }
}

export function validateCustomerData(customerData: any): {
  name: string
  address: string
  email?: string
  phone?: string
} {
  return {
    name: customerData.name || "Kunde",
    address: customerData.address || "Adresse nicht angegeben",
    email: customerData.email || undefined,
    phone: customerData.phone || undefined,
  }
}

export function calculateOfferTotals(positions: any[], riskPercent = 15) {
  const subtotal = positions.reduce((sum, pos) => sum + pos.quantity * pos.unitPrice, 0)
  const riskAmount = subtotal * (riskPercent / 100)
  const netTotal = subtotal + riskAmount
  const taxAmount = netTotal * 0.19 // German VAT rate
  const grossTotal = netTotal + taxAmount

  return {
    subtotal,
    riskAmount,
    netTotal,
    taxAmount,
    grossTotal,
  }
}
