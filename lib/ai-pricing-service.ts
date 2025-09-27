// Erweiterte KI-Services für intelligente Preisfindung
// Basiert auf der Preisdatenbank und historischen Angeboten

import { generateText } from "ai"

export interface PricingSearchCriteria {
  description: string
  branch: string
  projectType?: string
  size?: string
  location?: string
  urgency?: "low" | "medium" | "high"
}

export interface FoundPrice {
  id: string
  description: string
  unitPrice: number
  unit: string
  quantity: number
  totalPrice: number
  confidence: number
  sourceOffer: {
    id: string
    filename: string
    customerName: string
    offerDate: string
    projectType: string
  }
  similarityScore: number
  priceRange: {
    min: number
    max: number
    average: number
  }
}

export interface PricingAnalysisResult {
  searchCriteria: PricingSearchCriteria
  foundPrices: FoundPrice[]
  recommendedPrice: {
    unitPrice: number
    totalPrice: number
    confidence: number
    reasoning: string
  }
  marketAnalysis: {
    averagePrice: number
    priceRange: { min: number; max: number }
    competitivePosition: "low" | "medium" | "high"
    recommendations: string[]
  }
  riskFactors: string[]
  alternatives: Array<{
    description: string
    unitPrice: number
    reasoning: string
  }>
}

export interface PDFAnalysisResult {
  extractedPositions: Array<{
    position: number
    description: string
    quantity: number
    unit: string
    unitPrice: number
    totalPrice: number
    category: string
  }>
  metadata: {
    customerName?: string
    projectType?: string
    totalAmount?: number
    offerDate?: string
    branch?: string
  }
  confidence: number
  processingTime: number
}

// KI-basierte PDF-Analyse für Angebots-Extraktion
export async function analyzePDFContent(pdfContent: string, filename: string): Promise<PDFAnalysisResult> {
  const startTime = Date.now()

  try {
    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt: `
Analysiere das folgende PDF-Angebot und extrahiere strukturierte Daten:

DATEINAME: ${filename}

PDF INHALT:
${pdfContent}

AUFGABE:
Extrahiere alle Angebotspositionen mit folgenden Informationen:
- Position/Nummer
- Beschreibung der Leistung
- Menge
- Einheit (Stk, m², m, etc.)
- Einzelpreis
- Gesamtpreis

Zusätzlich extrahiere Metadaten:
- Kundenname
- Projekttyp
- Gesamtsumme
- Angebotsdatum
- Gewerk/Branch

ANTWORT FORMAT (JSON):
{
  "extractedPositions": [
    {
      "position": 1,
      "description": "Beschreibung der Leistung",
      "quantity": 10.5,
      "unit": "m²",
      "unitPrice": 45.50,
      "totalPrice": 477.75,
      "category": "Sanitär"
    }
  ],
  "metadata": {
    "customerName": "Max Mustermann",
    "projectType": "Badezimmer Sanierung",
    "totalAmount": 15750.00,
    "offerDate": "2024-01-15",
    "branch": "Sanitär"
  },
  "confidence": 0.95
}

Achte auf:
- Deutsche Formatierung (Komma als Dezimaltrennzeichen)
- Realistische Preise
- Korrekte Einheiten
- Vollständige Beschreibungen
`,
    })

    const analysisResult = JSON.parse(text)
    const processingTime = Date.now() - startTime

    return {
      ...analysisResult,
      processingTime,
    }
  } catch (error) {
    console.error("PDF Analysis Error:", error)
    return {
      extractedPositions: [],
      metadata: {},
      confidence: 0,
      processingTime: Date.now() - startTime,
    }
  }
}

// Intelligente Preissuche in der Datenbank
export async function searchSimilarPrices(criteria: PricingSearchCriteria): Promise<PricingAnalysisResult> {
  // Simuliere Datenbankabfrage - in Produktion würde hier eine echte Supabase-Abfrage stehen
  const mockFoundPrices: FoundPrice[] = [
    {
      id: "1",
      description: "Badezimmer Fliesen verlegen, inkl. Material",
      unitPrice: 65.0,
      unit: "m²",
      quantity: 20,
      totalPrice: 1300.0,
      confidence: 0.92,
      sourceOffer: {
        id: "offer-1",
        filename: "Angebot_Mustermann_Bad_2024.pdf",
        customerName: "Familie Mustermann",
        offerDate: "2024-01-15",
        projectType: "Badezimmer Sanierung",
      },
      similarityScore: 0.95,
      priceRange: { min: 55.0, max: 75.0, average: 65.0 },
    },
    {
      id: "2",
      description: "Sanitärinstallation komplett",
      unitPrice: 850.0,
      unit: "Stk",
      quantity: 1,
      totalPrice: 850.0,
      confidence: 0.88,
      sourceOffer: {
        id: "offer-2",
        filename: "Angebot_Schmidt_Sanitär_2024.pdf",
        customerName: "Herr Schmidt",
        offerDate: "2024-02-03",
        projectType: "Sanitär Erneuerung",
      },
      similarityScore: 0.87,
      priceRange: { min: 750.0, max: 950.0, average: 850.0 },
    },
  ]

  // KI-basierte Preisempfehlung
  const { text: pricingRecommendation } = await generateText({
    model: "openai/gpt-4o",
    prompt: `
Als Experte für Handwerkspreise analysiere die folgenden gefundenen Preise und gib eine Empfehlung:

SUCHKRITERIEN:
- Beschreibung: ${criteria.description}
- Gewerk: ${criteria.branch}
- Projekttyp: ${criteria.projectType || "Nicht angegeben"}
- Größe: ${criteria.size || "Nicht angegeben"}
- Standort: ${criteria.location || "Deutschland"}
- Dringlichkeit: ${criteria.urgency || "medium"}

GEFUNDENE PREISE:
${mockFoundPrices
  .map(
    (price) => `
- ${price.description}
  Preis: €${price.unitPrice}/${price.unit}
  Quelle: ${price.sourceOffer.filename}
  Ähnlichkeit: ${(price.similarityScore * 100).toFixed(0)}%
`,
  )
  .join("")}

AUFGABE:
Gib eine strukturierte Preisempfehlung im JSON-Format:

{
  "recommendedPrice": {
    "unitPrice": 65.00,
    "totalPrice": 1300.00,
    "confidence": 0.90,
    "reasoning": "Basierend auf ähnlichen Projekten..."
  },
  "marketAnalysis": {
    "averagePrice": 65.00,
    "priceRange": {"min": 55.00, "max": 75.00},
    "competitivePosition": "medium",
    "recommendations": ["Preis liegt im Marktdurchschnitt", "Qualität betonen"]
  },
  "riskFactors": ["Materialpreisschwankungen", "Komplexität des Projekts"],
  "alternatives": [
    {
      "description": "Günstigere Alternative ohne Premium-Material",
      "unitPrice": 55.00,
      "reasoning": "Kosteneinsparung durch Standardmaterial"
    }
  ]
}

Berücksichtige:
- Aktuelle Marktpreise
- Regionale Unterschiede
- Projektspezifische Faktoren
- Risiken und Alternativen
`,
  })

  try {
    const aiAnalysis = JSON.parse(pricingRecommendation)

    return {
      searchCriteria: criteria,
      foundPrices: mockFoundPrices,
      ...aiAnalysis,
    }
  } catch (error) {
    console.error("Pricing Analysis Error:", error)
    // Fallback-Antwort
    return {
      searchCriteria: criteria,
      foundPrices: mockFoundPrices,
      recommendedPrice: {
        unitPrice: 65.0,
        totalPrice: 1300.0,
        confidence: 0.7,
        reasoning: "Basierend auf ähnlichen Projekten in der Datenbank",
      },
      marketAnalysis: {
        averagePrice: 65.0,
        priceRange: { min: 55.0, max: 75.0 },
        competitivePosition: "medium",
        recommendations: ["Preis liegt im Marktdurchschnitt"],
      },
      riskFactors: ["Materialpreisschwankungen"],
      alternatives: [],
    }
  }
}

// Automatische Angebotserstellung basierend auf KI-Analyse
export async function generateOfferFromAnalysis(
  projectDescription: string,
  customerInfo: { name: string; email: string; address?: string },
  analysisResult: PricingAnalysisResult,
): Promise<{
  positions: Array<{
    description: string
    quantity: number
    unit: string
    unitPrice: number
    totalPrice: number
  }>
  subtotal: number
  tax: number
  total: number
  notes: string[]
}> {
  const { text } = await generateText({
    model: "openai/gpt-4o",
    prompt: `
Erstelle ein detailliertes Angebot basierend auf der KI-Preisanalyse:

PROJEKTBESCHREIBUNG:
${projectDescription}

KUNDE:
- Name: ${customerInfo.name}
- E-Mail: ${customerInfo.email}
- Adresse: ${customerInfo.address || "Nicht angegeben"}

PREISANALYSE:
${JSON.stringify(analysisResult, null, 2)}

AUFGABE:
Erstelle ein strukturiertes Angebot im JSON-Format:

{
  "positions": [
    {
      "description": "Detaillierte Leistungsbeschreibung",
      "quantity": 20.0,
      "unit": "m²",
      "unitPrice": 65.00,
      "totalPrice": 1300.00
    }
  ],
  "subtotal": 1300.00,
  "tax": 247.00,
  "total": 1547.00,
  "notes": [
    "Preise verstehen sich zzgl. 19% MwSt.",
    "Angebot gültig für 30 Tage"
  ]
}

Berücksichtige:
- Deutsche Handwerksstandards
- Realistische Mengen und Preise
- Vollständige Leistungsbeschreibungen
- Angemessene Gewinnmargen
- Risikofaktoren aus der Analyse
`,
  })

  try {
    return JSON.parse(text)
  } catch (error) {
    console.error("Offer Generation Error:", error)
    // Fallback-Angebot
    return {
      positions: [
        {
          description: projectDescription,
          quantity: 1,
          unit: "Pauschal",
          unitPrice: analysisResult.recommendedPrice.unitPrice,
          totalPrice: analysisResult.recommendedPrice.totalPrice,
        },
      ],
      subtotal: analysisResult.recommendedPrice.totalPrice,
      tax: analysisResult.recommendedPrice.totalPrice * 0.19,
      total: analysisResult.recommendedPrice.totalPrice * 1.19,
      notes: ["Preise verstehen sich zzgl. 19% MwSt.", "Angebot gültig für 30 Tage"],
    }
  }
}

// Cache-Management für Preissuchen
export async function getCachedPricing(searchHash: string): Promise<PricingAnalysisResult | null> {
  // In Produktion: Supabase-Abfrage auf ai_pricing_cache Tabelle
  // Simuliere Cache-Lookup
  return null
}

export async function cachePricingResult(
  searchHash: string,
  criteria: PricingSearchCriteria,
  result: PricingAnalysisResult,
): Promise<void> {
  // In Produktion: Speichere in ai_pricing_cache Tabelle
  console.log("Caching pricing result:", { searchHash, criteria, result })
}

// Hilfsfunktion für Search-Hash-Generierung
export function generateSearchHash(criteria: PricingSearchCriteria): string {
  const searchString = JSON.stringify(criteria)
  // Einfacher Hash - in Produktion sollte crypto.createHash verwendet werden
  return btoa(searchString)
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 32)
}

// Batch-Verarbeitung für PDF-Uploads
export async function batchAnalyzePDFs(
  files: Array<{ filename: string; content: string }>,
): Promise<Array<{ filename: string; result: PDFAnalysisResult; error?: string }>> {
  const results = []

  for (const file of files) {
    try {
      const result = await analyzePDFContent(file.content, file.filename)
      results.push({ filename: file.filename, result })
    } catch (error) {
      results.push({
        filename: file.filename,
        result: {
          extractedPositions: [],
          metadata: {},
          confidence: 0,
          processingTime: 0,
        },
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  return results
}
