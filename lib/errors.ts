export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401)
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404)
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(message, 409)
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super(message, 429)
  }
}

// Error handler for API routes
export function handleApiError(error: unknown): { error: string; statusCode: number } {
  console.error("API Error:", error)

  if (error instanceof AppError) {
    return {
      error: error.message,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof Error) {
    // Don't expose internal errors in production
    const message = process.env.NODE_ENV === "production" ? "Ein interner Fehler ist aufgetreten" : error.message

    return {
      error: message,
      statusCode: 500,
    }
  }

  return {
    error: "Ein unbekannter Fehler ist aufgetreten",
    statusCode: 500,
  }
}

// Global error boundary component
export function logError(error: Error, errorInfo?: { componentStack: string }) {
  console.error("Application Error:", error)
  if (errorInfo) {
    console.error("Component Stack:", errorInfo.componentStack)
  }

  // In production, you would send this to your error tracking service
  // e.g., Sentry, LogRocket, etc.
}
