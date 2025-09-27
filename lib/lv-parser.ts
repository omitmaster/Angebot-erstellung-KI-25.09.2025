// LV (Leistungsverzeichnis) Parser for construction specifications
// Handles PDF, Excel, and GAEB formats

export interface LVPosition {
  id: string
  code: string
  title: string
  description: string
  unit: string
  quantity?: number
  unitPrice?: number
  totalPrice?: number
  status: "clear" | "assumption" | "unclear"
  comments?: string
  questions?: string[]
  category: string
  rawData?: any
}

export interface LVDocument {
  id: string
  filename: string
  type: "pdf" | "excel" | "gaeb"
  positions: LVPosition[]
  metadata: {
    projectName?: string
    projectNumber?: string
    client?: string
    date?: string
    totalPositions: number
    totalValue?: number
  }
  analysisResults: {
    clearPositions: number
    assumptionPositions: number
    unclearPositions: number
    completeness: number
  }
}

// Mock LV parsing function - in production this would use actual document parsing libraries
export async function parseLVDocument(file: File): Promise<LVDocument> {
  // Simulate parsing delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const fileType = getFileType(file.name)

  // Mock parsed data based on file type
  const mockPositions: LVPosition[] = [
    {
      id: "1",
      code: "01.001",
      title: "Arbeitsgerüst stellen und abbauen",
      description: "Arbeitsgerüst bis 7m Höhe, inkl. Auf- und Abbau",
      unit: "m²",
      quantity: 200,
      unitPrice: 8.5,
      totalPrice: 1700,
      status: "clear",
      category: "Gerüstarbeiten",
    },
    {
      id: "2",
      code: "02.001",
      title: "Untergrund vorbereiten",
      description: "Fassade reinigen, grundieren und spachteln",
      unit: "m²",
      quantity: 180,
      status: "assumption",
      comments: "Annahme: normaler Reinigungsaufwand",
      questions: ["Welcher Verschmutzungsgrad liegt vor?", "Sind Risse oder Schäden vorhanden?"],
      category: "Vorarbeiten",
    },
    {
      id: "3",
      code: "03.001",
      title: "WDVS kleben und dübeln",
      description: "14cm EPS-Dämmung vollflächig verkleben und mechanisch befestigen",
      unit: "m²",
      unitPrice: 45.0,
      status: "unclear",
      comments: "Menge nicht eindeutig aus Plänen ersichtlich",
      questions: ["Welche Fläche soll gedämmt werden?", "Sind Fenster- und Türöffnungen abzuziehen?"],
      category: "Dämmarbeiten",
    },
  ]

  return {
    id: Math.random().toString(36).substr(2, 9),
    filename: file.name,
    type: fileType,
    positions: mockPositions,
    metadata: {
      projectName: "WDVS Sanierung Musterstraße",
      projectNumber: "2024-001",
      client: "Müller Bau GmbH",
      date: new Date().toISOString().split("T")[0],
      totalPositions: mockPositions.length,
      totalValue: mockPositions.reduce((sum, pos) => sum + (pos.totalPrice || 0), 0),
    },
    analysisResults: {
      clearPositions: mockPositions.filter((p) => p.status === "clear").length,
      assumptionPositions: mockPositions.filter((p) => p.status === "assumption").length,
      unclearPositions: mockPositions.filter((p) => p.status === "unclear").length,
      completeness: 75,
    },
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

// AI-powered position analysis
export async function analyzePosition(position: LVPosition, context?: any): Promise<LVPosition> {
  // Simulate AI analysis
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const analyzedPosition = { ...position }

  // Mock AI analysis logic
  if (!position.quantity && !position.unitPrice) {
    analyzedPosition.status = "unclear"
    analyzedPosition.questions = [
      "Welche Menge ist für diese Position vorgesehen?",
      "Gibt es Pläne oder Maße zur Mengenermittlung?",
    ]
  } else if (!position.quantity || !position.unitPrice) {
    analyzedPosition.status = "assumption"
    analyzedPosition.comments = "Teilweise Informationen vorhanden - Annahmen erforderlich"
    analyzedPosition.questions = [
      position.quantity ? "Einheitspreis muss kalkuliert werden" : "Menge muss ermittelt werden",
    ]
  } else {
    analyzedPosition.status = "clear"
    analyzedPosition.totalPrice = position.quantity * position.unitPrice
  }

  return analyzedPosition
}

// Generate pricing based on pricebook
export async function calculatePositionPrice(
  position: LVPosition,
  pricebookItems: any[],
  settings: any,
): Promise<LVPosition> {
  // Find matching pricebook item
  const matchingItem = pricebookItems.find(
    (item) =>
      item.title.toLowerCase().includes(position.title.toLowerCase().split(" ")[0]) || item.code === position.code,
  )

  if (matchingItem && position.quantity) {
    const laborCost = (matchingItem.base_minutes / 60) * settings.labor_rate_eur_per_hour
    const materialCost = matchingItem.base_material_cost * (1 + matchingItem.markup_material_pct / 100)
    const unitPrice = (laborCost + materialCost) * (1 + settings.default_overhead_pct / 100)

    return {
      ...position,
      unitPrice: Number.parseFloat(unitPrice.toFixed(2)),
      totalPrice: Number.parseFloat((unitPrice * position.quantity).toFixed(2)),
      status: position.status === "unclear" ? "assumption" : position.status,
      comments: position.comments
        ? `${position.comments}\nPreis basiert auf Preisbuch-Position ${matchingItem.code}`
        : `Preis basiert auf Preisbuch-Position ${matchingItem.code}`,
    }
  }

  return position
}

// Generate follow-up questions for unclear positions
export function generateQuestions(positions: LVPosition[]): string[] {
  const questions: string[] = []

  positions.forEach((position) => {
    if (position.status !== "clear" && position.questions) {
      questions.push(`Position ${position.code} - ${position.title}:`)
      position.questions.forEach((q) => questions.push(`  • ${q}`))
      questions.push("")
    }
  })

  return questions
}

// Export LV to different formats
export async function exportLV(document: LVDocument, format: "pdf" | "excel" | "gaeb"): Promise<Blob> {
  // Mock export - in production this would generate actual files
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const mockContent = `LV Export - ${document.filename}\n\nPositionen:\n${document.positions
    .map((p) => `${p.code}: ${p.title} - ${p.quantity || "?"} ${p.unit}`)
    .join("\n")}`

  return new Blob([mockContent], { type: "text/plain" })
}

// GAEB format specific functions
export interface GAEBPosition {
  ordinalNumber: string
  shortText: string
  longText: string
  unit: string
  quantity?: number
  unitPrice?: number
  totalPrice?: number
}

export function parseGAEBFile(file: File): Promise<GAEBPosition[]> {
  // Mock GAEB parsing - in production this would use proper GAEB libraries
  return Promise.resolve([])
}

export function exportToGAEB(positions: LVPosition[]): Promise<Blob> {
  // Mock GAEB export
  return Promise.resolve(new Blob(["GAEB Export"], { type: "application/xml" }))
}
