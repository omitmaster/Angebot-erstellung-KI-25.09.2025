import { type NextRequest, NextResponse } from "next/server"
import { analyzeLVDocument, extractTextFromFile, calculatePositionPricing } from "@/lib/ai/lv-analysis-service"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] LV Analysis API: Starting request processing")

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.error("[v0] LV Analysis API: No file provided")
      return NextResponse.json(
        {
          error: "Keine Datei bereitgestellt",
          details: "Bitte laden Sie eine PDF-, Excel- oder GAEB-Datei hoch.",
        },
        { status: 400 },
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      console.error(`[v0] LV Analysis API: File too large: ${file.size} bytes`)
      return NextResponse.json(
        {
          error: "Datei zu groß",
          details: `Die Datei ist ${Math.round(file.size / 1024 / 1024)}MB groß. Maximale Dateigröße: 10MB.`,
        },
        { status: 400 },
      )
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/plain",
    ]

    const allowedExtensions = [".pdf", ".xlsx", ".xls", ".x80", ".x81", ".x82", ".x83"]
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      console.error(`[v0] LV Analysis API: Invalid file type: ${file.type}, extension: ${fileExtension}`)
      return NextResponse.json(
        {
          error: "Ungültiger Dateityp",
          details: "Unterstützte Formate: PDF, Excel (.xlsx, .xls), GAEB (.x80-.x83)",
        },
        { status: 400 },
      )
    }

    console.log(`[v0] LV Analysis API: Processing file ${file.name} (${file.type}, ${file.size} bytes)`)

    // Extract file content with detailed error handling
    let fileContent: string
    try {
      fileContent = await extractTextFromFile(file)
      console.log(`[v0] LV Analysis API: File content extracted successfully (${fileContent.length} characters)`)
    } catch (extractError) {
      console.error("[v0] LV Analysis API: File extraction failed:", extractError)
      return NextResponse.json(
        {
          error: "Datei konnte nicht gelesen werden",
          details: extractError instanceof Error ? extractError.message : "Unbekannter Fehler beim Lesen der Datei",
        },
        { status: 422 },
      )
    }

    // Validate extracted content
    if (!fileContent || fileContent.trim().length < 50) {
      console.error("[v0] LV Analysis API: Insufficient file content")
      return NextResponse.json(
        {
          error: "Unzureichender Dateiinhalt",
          details:
            "Die Datei enthält nicht genügend Text für eine Analyse. Stellen Sie sicher, dass die Datei lesbare Inhalte enthält.",
        },
        { status: 422 },
      )
    }

    const fileType = getFileType(file.name)
    console.log(`[v0] LV Analysis API: Detected file type: ${fileType}`)

    // Analyze document with AI
    let analysis
    try {
      analysis = await analyzeLVDocument(fileContent, file.name, fileType)
      console.log(`[v0] LV Analysis API: Document analyzed successfully (${analysis.positions.length} positions)`)
    } catch (analysisError) {
      console.error("[v0] LV Analysis API: Document analysis failed:", analysisError)
      return NextResponse.json(
        {
          error: "Dokumentenanalyse fehlgeschlagen",
          details:
            analysisError instanceof Error ? analysisError.message : "KI-Analyse konnte nicht durchgeführt werden",
        },
        { status: 500 },
      )
    }

    // Get pricing data from Supabase
    let pricebookData: any[] = []
    try {
      const supabase = await createClient()
      const { data, error: supabaseError } = await supabase.from("pricebook_items").select("*").limit(100)

      if (supabaseError) {
        console.error("[v0] LV Analysis API: Supabase error:", supabaseError)
        // Continue without pricing data rather than failing
        console.log("[v0] LV Analysis API: Continuing without pricing data")
      } else {
        pricebookData = data || []
        console.log(`[v0] LV Analysis API: Retrieved ${pricebookData.length} pricing items`)
      }
    } catch (dbError) {
      console.error("[v0] LV Analysis API: Database connection failed:", dbError)
      // Continue without pricing data
      console.log("[v0] LV Analysis API: Continuing without pricing data due to DB error")
    }

    // Calculate pricing for positions
    let positionsWithPricing
    try {
      positionsWithPricing = await Promise.all(
        analysis.positions.map(async (position) => {
          try {
            return await calculatePositionPricing(position, pricebookData)
          } catch (pricingError) {
            console.error(`[v0] LV Analysis API: Pricing failed for position ${position.code}:`, pricingError)
            // Return position without pricing rather than failing
            return position
          }
        }),
      )
      console.log(`[v0] LV Analysis API: Pricing calculated for ${positionsWithPricing.length} positions`)
    } catch (pricingError) {
      console.error("[v0] LV Analysis API: Pricing calculation failed:", pricingError)
      // Use original positions without pricing
      positionsWithPricing = analysis.positions
    }

    const finalAnalysis = {
      ...analysis,
      positions: positionsWithPricing,
      summary: {
        ...analysis.summary,
        estimatedValue: positionsWithPricing.reduce((sum, pos) => sum + ((pos as any).totalPrice || 0), 0),
      },
    }

    console.log("[v0] LV Analysis API: Analysis completed successfully")
    return NextResponse.json({ analysis: finalAnalysis })
  } catch (error) {
    console.error("[v0] LV Analysis API: Unexpected error:", error)

    // Provide user-friendly error messages
    let errorMessage = "Ein unerwarteter Fehler ist aufgetreten"
    let errorDetails = "Bitte versuchen Sie es erneut oder kontaktieren Sie den Support"

    if (error instanceof Error) {
      if (error.message.includes("fetch")) {
        errorMessage = "Netzwerkfehler"
        errorDetails = "Überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut"
      } else if (error.message.includes("timeout")) {
        errorMessage = "Zeitüberschreitung"
        errorDetails = "Die Analyse dauert zu lange. Versuchen Sie es mit einer kleineren Datei"
      } else if (error.message.includes("memory") || error.message.includes("heap")) {
        errorMessage = "Datei zu komplex"
        errorDetails = "Die Datei ist zu groß oder komplex für die Verarbeitung"
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
