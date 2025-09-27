export const config = {
  // App Configuration
  app: {
    name: "Angebots- & Prozessmeister",
    description: "Handwerk Business Management System",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },

  // Database Configuration
  database: {
    url: process.env.POSTGRES_URL!,
    directUrl: process.env.POSTGRES_URL_NON_POOLING!,
  },

  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },

  // Feature Flags
  features: {
    enableRegistration: process.env.NEXT_PUBLIC_ENABLE_REGISTRATION !== "false",
    enableAnalytics: process.env.NODE_ENV === "production",
    enableDebugLogs: process.env.NODE_ENV === "development",
  },

  // Email Configuration (for future use)
  email: {
    from: process.env.EMAIL_FROM || "noreply@handwerk-app.de",
    replyTo: process.env.EMAIL_REPLY_TO || "support@handwerk-app.de",
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // limit each IP to 100 requests per windowMs
  },
} as const

// Validate required environment variables
export function validateConfig() {
  const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "POSTGRES_URL"]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }
}

// Call validation on module load in production
if (process.env.NODE_ENV === "production") {
  validateConfig()
}
