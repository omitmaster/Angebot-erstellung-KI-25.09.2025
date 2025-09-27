import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { handleApiError } from "@/lib/errors"
import { validateData, userRegistrationSchema } from "@/lib/validations"
import { getClientIP } from "@/lib/auth/security"
import { registerRateLimit, getRateLimitKey } from "@/lib/auth/rate-limit"
import { securityHeaders } from "@/lib/auth/security"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = await getClientIP()
    const rateLimitKey = getRateLimitKey(clientIP, "register")
    const rateLimitCheck = registerRateLimit.check(rateLimitKey)

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: "Zu viele Registrierungsversuche. Bitte versuchen Sie es später erneut." },
        {
          status: 429,
          headers: {
            ...securityHeaders,
            "Retry-After": Math.ceil((rateLimitCheck.resetTime! - Date.now()) / 1000).toString(),
          },
        },
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = validateData(userRegistrationSchema, body)

    // Create Supabase client
    const supabase = await createClient()

    // Register user
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          user_type: validatedData.userType,
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          company_name: validatedData.companyName,
          phone: validatedData.phone,
        },
      },
    })

    if (error) {
      throw error
    }

    return NextResponse.json(
      {
        message: "Registrierung erfolgreich. Bitte überprüfen Sie Ihre E-Mail.",
        user: data.user,
      },
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
