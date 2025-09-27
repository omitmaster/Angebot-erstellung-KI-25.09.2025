import { type NextRequest, NextResponse } from "next/server"
import { analyzeLVDocument, extractTextFromFile, calculatePositionPricing } from "@/lib/ai/lv-analysis-service"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileContent = await extractTextFromFile(file)
    const fileType = getFileType(file.name)

    const analysis = await analyzeLVDocument(fileContent, file.name, fileType)

    const supabase = createServerClient()
    const { data: pricebookData } = await supabase.from("pricebook_items").select("*").limit(100)

    const positionsWithPricing = await Promise.all(
      analysis.positions.map((position) => calculatePositionPricing(position, pricebookData || [])),
    )

    const finalAnalysis = {
      ...analysis,
      positions: positionsWithPricing,
      summary: {
        ...analysis.summary,
        estimatedValue: positionsWithPricing.reduce((sum, pos) => sum + (pos.totalPrice || 0), 0),
      },
    }

    return NextResponse.json({ analysis: finalAnalysis })
  } catch (error) {
    console.error("LV Analysis API error:", error)
    return NextResponse.json(
      { error: "Analysis failed", details: error instanceof Error ? error.message : "Unknown error" },
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
