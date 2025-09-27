interface LogEntry {
  level: "debug" | "info" | "warn" | "error"
  message: string
  timestamp: string
  userId?: string
  requestId?: string
  context?: Record<string, any>
  error?: {
    name: string
    message: string
    stack?: string
  }
}

class Logger {
  private isProduction: boolean
  private userId?: string
  private requestId?: string

  constructor() {
    this.isProduction = process.env.NODE_ENV === "production"
  }

  setContext(userId?: string, requestId?: string) {
    this.userId = userId
    this.requestId = requestId
  }

  private log(level: LogEntry["level"], message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      requestId: this.requestId,
      context,
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }

    if (this.isProduction) {
      // In production, send to logging service like:
      // - Vercel's built-in logging
      // - DataDog
      // - LogRocket
      // - Custom logging endpoint
      this.sendToLoggingService(entry)
    } else {
      // Development logging
      const color = {
        debug: "\x1b[36m", // cyan
        info: "\x1b[32m", // green
        warn: "\x1b[33m", // yellow
        error: "\x1b[31m", // red
      }[level]

      console.log(
        `${color}[${level.toUpperCase()}]\x1b[0m ${entry.timestamp} - ${message}`,
        context ? context : "",
        error ? error : "",
      )
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log("debug", message, context)
  }

  info(message: string, context?: Record<string, any>) {
    this.log("info", message, context)
  }

  warn(message: string, context?: Record<string, any>) {
    this.log("warn", message, context)
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log("error", message, context, error)
  }

  // Business-specific logging methods
  logUserAction(action: string, userId: string, context?: Record<string, any>) {
    this.info(`User action: ${action}`, {
      userId,
      action,
      ...context,
    })
  }

  logApiRequest(method: string, path: string, statusCode: number, duration: number, userId?: string) {
    this.info(`API ${method} ${path}`, {
      method,
      path,
      statusCode,
      duration,
      userId,
    })
  }

  logDatabaseQuery(query: string, duration: number, success: boolean) {
    this.debug(`Database query ${success ? "success" : "error"}`, {
      query: query.substring(0, 100), // Truncate long queries
      duration,
      success,
    })
  }

  logSecurityEvent(event: string, userId?: string, context?: Record<string, any>) {
    this.warn(`Security event: ${event}`, {
      userId,
      event,
      ...context,
    })
  }

  private async sendToLoggingService(entry: LogEntry) {
    try {
      // In production, implement actual logging service integration
      console.log(JSON.stringify(entry))
    } catch (error) {
      // Fallback to console if logging service fails
      console.error("Failed to send log to service:", error)
      console.log(JSON.stringify(entry))
    }
  }
}

export const logger = new Logger()

// Middleware helper for request logging
export function createRequestLogger(userId?: string) {
  const requestId = Math.random().toString(36).substring(2, 15)
  const requestLogger = new Logger()
  requestLogger.setContext(userId, requestId)
  return requestLogger
}
