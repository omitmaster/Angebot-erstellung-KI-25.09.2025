import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/octet-stream", // for GAEB files
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }

    // Upload file to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage.from("offer-uploads").upload(fileName, file)

    if (uploadError) {
      console.error("[v0] Upload error:", uploadError)
      return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("offer-uploads").getPublicUrl(fileName)

    // Save to database
    const { data: offerData, error: dbError } = await supabase
      .from("uploaded_offers")
      .insert({
        filename: file.name,
        file_url: publicUrl,
        file_type: file.name.split(".").pop()?.toLowerCase() || "unknown",
        file_size_bytes: file.size,
        analysis_status: "pending",
      })
      .select()
      .single()

    if (dbError) {
      console.error("[v0] Database error:", dbError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // Trigger analysis (async)
    // This would normally call your AI analysis service
    console.log("[v0] Starting analysis for offer:", offerData.id)

    return NextResponse.json({
      success: true,
      offer: offerData,
    })
  } catch (error) {
    console.error("[v0] Upload API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
