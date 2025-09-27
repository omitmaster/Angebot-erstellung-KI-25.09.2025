interface HealthCheck {
  name: string
  status: "healthy" | "unhealthy" | "degraded"
  responseTime: number
  error?: string
  timestamp: string
}

interface SystemHealth {
  overall: "healthy" | "unhealthy" | "degraded"
  checks: HealthCheck[]
  uptime: number
  timestamp: string
}

class HealthMonitor {
  private startTime: number
  private checks: Map<string, () => Promise<HealthCheck>> = new Map()

  constructor() {
    this.startTime = Date.now()
    this.registerDefaultChecks()
  }

  private registerDefaultChecks() {
    // Database health check
    this.registerCheck("database", async () => {
      const start = performance.now()
      try {
        const { createClient } = await import("@/lib/supabase/server")
        const supabase = await createClient()

        // Simple query to test database connectivity
        const { error } = await supabase.from("profiles").select("id").limit(1)

        const responseTime = performance.now() - start

        if (error) {
          return {
            name: "database",
            status: "unhealthy",
            responseTime,
            error: error.message,
            timestamp: new Date().toISOString(),
          }
        }

        return {
          name: "database",
          status: responseTime > 1000 ? "degraded" : "healthy",
          responseTime,
          timestamp: new Date().toISOString(),
        }
      } catch (error) {
        return {
          name: "database",
          status: "unhealthy",
          responseTime: performance.now() - start,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        }
      }
    })

    // Memory usage check
    this.registerCheck("memory", async () => {
      const start = performance.now()
      try {
        let memoryUsage = 0

        // In Node.js environment
        if (typeof process !== "undefined" && process.memoryUsage) {
          const usage = process.memoryUsage()
          memoryUsage = usage.heapUsed / usage.heapTotal
        }
        // In browser environment
        else if (typeof window !== "undefined" && (window as any).performance?.memory) {
          const memory = (window as any).performance.memory
          memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize
        }

        const responseTime = performance.now() - start
        const status = memoryUsage > 0.9 ? "unhealthy" : memoryUsage > 0.7 ? "degraded" : "healthy"

        return {
          name: "memory",
          status,
          responseTime,
          error: memoryUsage > 0.9 ? `High memory usage: ${(memoryUsage * 100).toFixed(1)}%` : undefined,
          timestamp: new Date().toISOString(),
        }
      } catch (error) {
        return {
          name: "memory",
          status: "unhealthy",
          responseTime: performance.now() - start,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        }
      }
    })

    // External API health check (example)
    this.registerCheck("external_apis", async () => {
      const start = performance.now()
      try {
        // Check if external services are reachable
        // This is a placeholder - in production you'd check actual external APIs
        const responseTime = performance.now() - start

        return {
          name: "external_apis",
          status: "healthy",
          responseTime,
          timestamp: new Date().toISOString(),
        }
      } catch (error) {
        return {
          name: "external_apis",
          status: "unhealthy",
          responseTime: performance.now() - start,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        }
      }
    })
  }

  registerCheck(name: string, checkFn: () => Promise<HealthCheck>) {
    this.checks.set(name, checkFn)
  }

  async runHealthChecks(): Promise<SystemHealth> {
    const checks: HealthCheck[] = []

    // Run all health checks in parallel
    const checkPromises = Array.from(this.checks.entries()).map(async ([name, checkFn]) => {
      try {
        return await checkFn()
      } catch (error) {
        return {
          name,
          status: "unhealthy" as const,
          responseTime: 0,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        }
      }
    })

    const results = await Promise.all(checkPromises)
    checks.push(...results)

    // Determine overall health
    const unhealthyCount = checks.filter((c) => c.status === "unhealthy").length
    const degradedCount = checks.filter((c) => c.status === "degraded").length

    let overall: SystemHealth["overall"]
    if (unhealthyCount > 0) {
      overall = "unhealthy"
    } else if (degradedCount > 0) {
      overall = "degraded"
    } else {
      overall = "healthy"
    }

    return {
      overall,
      checks,
      uptime: Date.now() - this.startTime,
      timestamp: new Date().toISOString(),
    }
  }

  getUptime(): number {
    return Date.now() - this.startTime
  }
}

export const healthMonitor = new HealthMonitor()

// Health check API endpoint helper
export async function createHealthResponse(): Promise<Response> {
  const health = await healthMonitor.runHealthChecks()

  const status = health.overall === "healthy" ? 200 : health.overall === "degraded" ? 200 : 503

  return new Response(JSON.stringify(health, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  })
}
