import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { handleApiError, AuthenticationError } from "@/lib/errors"
import { validateData, projectCreateSchema } from "@/lib/validations"
import { securityHeaders } from "@/lib/auth/security"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new AuthenticationError()
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = supabase
      .from("projects")
      .select(`
        *,
        customers(*),
        offers(count)
      `)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    const { data: projects, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ projects }, { headers: securityHeaders })
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json(
      { error: errorMessage },
      {
        status: statusCode,
        headers: securityHeaders,
      },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new AuthenticationError()
    }

    const body = await request.json()
    const validatedData = validateData(projectCreateSchema, body)

    const { data, error } = await supabase
      .from("projects")
      .insert({
        ...validatedData,
        status: "draft",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(
      { project: data },
      {
        status: 201,
        headers: securityHeaders,
      },
    )
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json(
      { error: errorMessage },
      {
        status: statusCode,
        headers: securityHeaders,
      },
    )
  }
}
