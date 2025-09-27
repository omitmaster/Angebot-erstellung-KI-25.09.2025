import { generateObject, generateText } from "ai"
import { z } from "zod"
import { Buffer } from "buffer"

// Schema für LV-Position Analyse
const LVPositionSchema = z.object({
  id: z.string(),
  code: z.string().describe("Position code like 01.001"),
  title: z.string().describe("Short title of the work item"),
  description: z.string().describe("Detailed description of the work"),
  unit: z.string().describe("Unit of measurement (m², m³, Stk, etc.)"),
  quantity: z.number().optional().describe("Quantity if determinable from document"),
  category: z.string().describe("Work category (Gerüstarbeiten, Dämmarbeiten, etc.)"),
  status: z.enum(["clear", "assumption", "unclear"]).describe("Analysis status"),
  comments: z.string().optional().describe("Analysis comments or assumptions"),
  questions: z.array(z.string()).optional().describe("Questions for clarification"),
  confidence: z.number().min(0).max(1).describe("Confidence level of analysis"),
})

const LVDocumentAnalysisSchema = z.object({
  projectInfo: z.object({
    projectName: z.string().optional(),
    projectNumber: z.string().optional(),
    client: z.string().optional(),
    projectType: z.string().optional(),
    location: z.string().optional(),
  }),
  positions: z.array(LVPositionSchema),
  summary: z.object({
    totalPositions: z.number(),
    clearPositions: z.number(),
    assumptionPositions: z.number(),
    unclearPositions: z.number(),
    completeness: z.number().min(0).max(100).describe("Completeness percentage"),
    estimatedValue: z.number().optional().describe("Rough project value estimate"),
  }),
  recommendations: z.array(z.string()).describe("Recommendations for next steps"),
})

export type LVPosition = z.infer<typeof LVPositionSchema>
export type LVDocumentAnalysis = z.infer<typeof LVDocumentAnalysisSchema>

export async function analyzeLVDocument(
  fileContent: string,
  fileName: string,
  fileType: "pdf" | "excel" | "gaeb",
): Promise<LVDocumentAnalysis> {
  try {
    const { object } = await generateObject({
      model: "openai/gpt-4o",
      schema: LVDocumentAnalysisSchema,
      messages: [
        {
          role: "system",
          content: `Du bist ein Experte für deutsche Leistungsverzeichnisse (LV) im Bauwesen. 
          Analysiere das bereitgestellte Dokument und extrahiere alle Positionen mit folgenden Kriterien:
          
          - Status "clear": Alle Informationen (Menge, Beschreibung) sind vollständig
          - Status "assumption": Teilweise Informationen vorhanden, Annahmen nötig
          - Status "unclear": Wichtige Informationen fehlen oder sind unklar
          
          Kategorisiere Positionen nach deutschen Baugewerken (Gerüstarbeiten, Dämmarbeiten, Putzarbeiten, etc.).
          Generiere spezifische Rückfragen für unklare Positionen.`,
        },
        {
          role: "user",
          content: `Analysiere dieses ${fileType.toUpperCase()}-Dokument "${fileName}":

${fileContent}

Extrahiere alle Positionen und bewerte deren Vollständigkeit für eine Angebotserstellung.`,
        },
      ],
      maxOutputTokens: 4000,
      temperature: 0.1,
    })

    return object
  } catch (error) {
    console.error("LV Analysis failed:", error)
    throw new Error("Dokumentenanalyse fehlgeschlagen. Bitte versuchen Sie es erneut.")
  }
}

export async function calculatePositionPricing(
  position: LVPosition,
  pricebookData: any[],
): Promise<LVPosition & { unitPrice?: number; totalPrice?: number }> {
  try {
    const relevantPrices = pricebookData
      .filter(
        (item) =>
          item.title.toLowerCase().includes(position.title.toLowerCase().split(" ")[0]) ||
          item.category?.toLowerCase() === position.category.toLowerCase(),
      )
      .slice(0, 5) // Top 5 matches

    const { text } = await generateText({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "system",
          content: `Du bist ein Experte für Baupreise in Deutschland. 
          Kalkuliere realistische Einheitspreise basierend auf der Position und verfügbaren Preisdaten.
          Berücksichtige aktuelle Marktpreise, Materialkosten und Arbeitsaufwand.
          
          Antworte nur mit dem Einheitspreis als Zahl (ohne €-Zeichen) oder "NICHT_KALKULIERBAR" wenn keine Berechnung möglich ist.`,
        },
        {
          role: "user",
          content: `Position: ${position.title}
Beschreibung: ${position.description}
Einheit: ${position.unit}
Kategorie: ${position.category}

Verfügbare Preisdaten:
${relevantPrices.map((p) => `- ${p.title}: ${p.base_material_cost}€ Material, ${p.base_minutes}min Arbeitszeit`).join("\n")}

Kalkuliere den Einheitspreis pro ${position.unit}:`,
        },
      ],
      maxOutputTokens: 100,
      temperature: 0.1,
    })

    const unitPrice = Number.parseFloat(text.trim())

    if (!isNaN(unitPrice) && unitPrice > 0) {
      const totalPrice = position.quantity ? unitPrice * position.quantity : undefined

      return {
        ...position,
        unitPrice: Math.round(unitPrice * 100) / 100, // Round to 2 decimals
        totalPrice: totalPrice ? Math.round(totalPrice * 100) / 100 : undefined,
        status: position.status === "unclear" && position.quantity ? "assumption" : position.status,
        comments: position.comments
          ? `${position.comments}\nPreis basiert auf KI-Kalkulation mit Preisbuch-Daten`
          : `Preis basiert auf KI-Kalkulation mit Preisbuch-Daten`,
      }
    }

    return position
  } catch (error) {
    console.error("Price calculation failed:", error)
    return position
  }
}

export async function generateFollowUpQuestions(positions: LVPosition[], projectInfo: any): Promise<string[]> {
  const unclearPositions = positions.filter((p) => p.status !== "clear")

  if (unclearPositions.length === 0) {
    return []
  }

  try {
    const { text } = await generateText({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "system",
          content: `Du bist ein erfahrener Bauleiter und erstellst professionelle Rückfragen für Angebote.
          Generiere spezifische, praxisnahe Fragen um fehlende Informationen zu klären.
          Fragen sollen höflich, präzise und für Laien verständlich sein.`,
        },
        {
          role: "user",
          content: `Projekt: ${projectInfo.projectName || "Bauprojekt"}
Projekttyp: ${projectInfo.projectType || "Unbekannt"}

Unklare Positionen:
${unclearPositions
  .map(
    (p) =>
      `- ${p.code}: ${p.title}
    Problem: ${p.comments || "Informationen unvollständig"}
    Spezifische Fragen: ${p.questions?.join(", ") || "Keine"}`,
  )
  .join("\n\n")}

Erstelle eine strukturierte Liste mit Rückfragen für den Kunden:`,
        },
      ],
      maxOutputTokens: 1000,
      temperature: 0.3,
    })

    return text.split("\n").filter((line) => line.trim().length > 0)
  } catch (error) {
    console.error("Question generation failed:", error)
    return unclearPositions.flatMap((p) => p.questions || [])
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = getFileType(file.name)

  try {
    switch (fileType) {
      case "pdf":
        return await extractTextFromPDF(file)
      case "excel":
        return await extractTextFromExcel(file)
      case "gaeb":
        return await extractTextFromGAEB(file)
      default:
        throw new Error(`Unsupported file type: ${fileType}`)
    }
  } catch (error) {
    console.error("Text extraction failed:", error)
    throw new Error(`Fehler beim Lesen der ${fileType.toUpperCase()}-Datei`)
  }
}

function getFileType(filename: string): "pdf" | "excel" | "gaeb" {
  const extension = filename.toLowerCase().split(".").pop()

  switch (extension) {
    case "pdf":
      return "pdf"
    case "xlsx":
    case "xls":
      return "excel"
    case "x80":
    case "x81":
    case "x82":
    case "x83":
      return "gaeb"
    default:
      return "pdf"
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

    return data.text
  } catch (error) {
    console.error("[v0] PDF parsing failed:", error)

    // Fallback: Try to read as text (for text-based PDFs)
    try {
      const text = await file.text()
      if (text && text.length > 0) {
        console.log("[v0] Using fallback text extraction")
        return text
      }
    } catch (fallbackError) {
      console.error("[v0] Fallback text extraction failed:", fallbackError)
    }

    throw new Error(`PDF-Verarbeitung fehlgeschlagen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`)
  }
}

async function extractTextFromExcel(file: File): Promise<string> {
  try {
    // Import xlsx dynamically
    const XLSX = await import("xlsx")

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

async function extractTextFromGAEB(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const decoder = new TextDecoder("iso-8859-1") // GAEB typically uses ISO-8859-1
    const content = decoder.decode(arrayBuffer)

    // Basic GAEB structure parsing
    let extractedText = `GAEB-Inhalt aus ${file.name}:\n\n`

    // Look for common GAEB patterns
    const lines = content.split("\n")
    const currentSection = ""

    lines.forEach((line) => {
      const trimmedLine = line.trim()

      // Detect position codes (e.g., 01.001, 02.001)
      if (/^\d{2}\.\d{3}/.test(trimmedLine)) {
        extractedText += `\nPosition: ${trimmedLine}\n`
      }
      // Detect text blocks
      else if (trimmedLine.length > 10 && !trimmedLine.startsWith("#")) {
        extractedText += `${trimmedLine}\n`
      }
    })

    console.log(`[v0] GAEB parsed successfully: ${lines.length} lines processed`)

    return extractedText
  } catch (error) {
    console.error("[v0] GAEB parsing failed:", error)
    throw new Error(
      `GAEB-Verarbeitung fehlgeschlagen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
    )
  }
}
