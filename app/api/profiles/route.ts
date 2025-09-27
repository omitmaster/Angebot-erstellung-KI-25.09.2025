import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { handleApiError, AuthenticationError } from "@/lib/errors"
import { validateData, profileUpdateSchema } from "@/lib/validations"
import { securityHeaders } from "@/lib/auth/security"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new AuthenticationError()
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*, handwerker_profiles(*), kunde_profiles(*)")
      .eq("id", user.id)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ profile }, { headers: securityHeaders })
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

export async function PUT(request: NextRequest) {
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
    const validatedData = validateData(profileUpdateSchema, body)

    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ profile: data }, { headers: securityHeaders })
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
