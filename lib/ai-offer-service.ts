import { generateObject } from "ai"
import { z } from "zod"
import { Buffer } from "buffer"
import XLSX from "xlsx"

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
  // Process uploaded files and extract their content
  const fileContents: string[] = []

  for (const file of request.files) {
    try {
      const content = await extractFileContent(file)
      fileContents.push(content)
      console.log(`[v0] Successfully processed file: ${file.name}`)
    } catch (error) {
      console.error(`[v0] Failed to process file ${file.name}:`, error)
      fileContents.push(
        `Fehler beim Verarbeiten von ${file.name}: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
      )
    }
  }

  const fileInfo = request.files
    .map(
      (f, index) =>
        `${f.name} (${f.type}, ${Math.round(f.size / 1024)}KB)\nInhalt: ${fileContents[index]?.substring(0, 500)}${fileContents[index]?.length > 500 ? "..." : ""}`,
    )
    .join("\n\n")

  const prompt = `
Du bist ein erfahrener Bauexperte und Kalkulationsspezialist für deutsche Handwerksbetriebe.
Analysiere die folgende Kundenanfrage und erstelle eine detaillierte Projektbewertung.

KUNDENANFRAGE:
${request.message}

${fileInfo ? `HOCHGELADENE DATEIEN UND INHALTE:\n${fileInfo}` : ""}

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
Nutze die Informationen aus den hochgeladenen Dateien für eine präzise Bewertung.
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
    console.log(`[v0] Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`)

    if (file.type === "text/plain") {
      const content = await file.text()
      console.log(`[v0] Text file processed: ${content.length} characters`)
      return content
    }

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      return await extractTextFromPDF(file)
    }

    if (
      file.type.includes("spreadsheet") ||
      file.type.includes("excel") ||
      file.name.toLowerCase().endsWith(".xlsx") ||
      file.name.toLowerCase().endsWith(".xls")
    ) {
      return await extractTextFromExcel(file)
    }

    if (file.type.startsWith("image/")) {
      return `Bild-Datei: ${file.name} (${Math.round(file.size / 1024)}KB) - Bildanalyse wird unterstützt`
    }

    // Try to read as text for other file types
    try {
      const content = await file.text()
      if (content && content.trim().length > 0) {
        console.log(`[v0] Generic text extraction successful: ${content.length} characters`)
        return content
      }
    } catch (textError) {
      console.log(`[v0] Could not read as text: ${textError}`)
    }

    return `Datei: ${file.name} (${file.type}, ${Math.round(file.size / 1024)}KB) - Inhalt konnte nicht extrahiert werden`
  } catch (error) {
    console.error(`[v0] Error extracting file content from ${file.name}:`, error)
    return `Fehler beim Lesen der Datei: ${file.name} - ${error instanceof Error ? error.message : "Unbekannter Fehler"}`
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Import pdf-parse dynamically to avoid SSR issues
    const pdfParse = (await import("pdf-parse")).default

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const data = await pdfParse(buffer, {
      // Optimize for construction documents
      max: 0, // Parse all pages
      version: "v1.10.100",
    })

    if (!data.text || data.text.trim().length === 0) {
      throw new Error("PDF enthält keinen lesbaren Text")
    }

    console.log(`[v0] PDF parsed successfully: ${data.numpages} pages, ${data.text.length} characters`)

    return `PDF-Inhalt aus ${file.name} (${data.numpages} Seiten):\n\n${data.text}`
  } catch (error) {
    console.error("[v0] PDF parsing failed:", error)

    // Fallback: Try to read as text (for text-based PDFs)
    try {
      const text = await file.text()
      if (text && text.length > 0) {
        console.log("[v0] Using fallback text extraction for PDF")
        return `PDF-Inhalt aus ${file.name} (Fallback-Extraktion):\n\n${text}`
      }
    } catch (fallbackError) {
      console.error("[v0] Fallback text extraction failed:", fallbackError)
    }

    throw new Error(`PDF-Verarbeitung fehlgeschlagen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`)
  }
}

async function extractTextFromExcel(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: "array" })

    let extractedText = `Excel-Inhalt aus ${file.name}:\n\n`

    // Process all sheets
    workbook.SheetNames.forEach((sheetName, index) => {
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" })

      extractedText += `=== Arbeitsblatt: ${sheetName} ===\n`

      jsonData.forEach((row: any[], rowIndex) => {
        if (row.some((cell) => cell && cell.toString().trim())) {
          extractedText += row.join("\t") + "\n"
        }
      })

      extractedText += "\n"
    })

    console.log(`[v0] Excel parsed successfully: ${workbook.SheetNames.length} sheets`)

    return extractedText
  } catch (error) {
    console.error("[v0] Excel parsing failed:", error)
    throw new Error(
      `Excel-Verarbeitung fehlgeschlagen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
    )
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
