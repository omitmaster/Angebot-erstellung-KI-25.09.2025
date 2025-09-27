interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: string
  userId?: string
  route?: string
  userAgent?: string
}

class PerformanceMonitor {
  private isEnabled: boolean
  private metrics: PerformanceMetric[] = []
  private userId?: string

  constructor() {
    this.isEnabled = typeof window !== "undefined" && process.env.NODE_ENV === "production"

    if (this.isEnabled) {
      this.initializeWebVitals()
    }
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  // Core Web Vitals monitoring
  private initializeWebVitals() {
    if (typeof window === "undefined") return

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.recordMetric("LCP", lastEntry.startTime, "ms")
    }).observe({ entryTypes: ["largest-contentful-paint"] })

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        this.recordMetric("FID", entry.processingStart - entry.startTime, "ms")
      })
    }).observe({ entryTypes: ["first-input"] })

    // Cumulative Layout Shift (CLS)
    let clsValue = 0
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      this.recordMetric("CLS", clsValue, "score")
    }).observe({ entryTypes: ["layout-shift"] })

    // Time to First Byte (TTFB)
    window.addEventListener("load", () => {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
      if (navigation) {
        this.recordMetric("TTFB", navigation.responseStart - navigation.requestStart, "ms")
      }
    })
  }

  // Record custom metrics
  recordMetric(name: string, value: number, unit = "ms") {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      route: typeof window !== "undefined" ? window.location.pathname : undefined,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    }

    this.metrics.push(metric)
    this.sendMetric(metric)
  }

  // Measure function execution time
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - start
      this.recordMetric(name, duration, "ms")
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.recordMetric(`${name}_error`, duration, "ms")
      throw error
    }
  }

  measureSync<T>(name: string, fn: () => T): T {
    const start = performance.now()
    try {
      const result = fn()
      const duration = performance.now() - start
      this.recordMetric(name, duration, "ms")
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.recordMetric(`${name}_error`, duration, "ms")
      throw error
    }
  }

  // Database query performance
  recordDatabaseQuery(query: string, duration: number, success: boolean) {
    this.recordMetric(`db_query_${success ? "success" : "error"}`, duration, "ms")
  }

  // API endpoint performance
  recordApiCall(endpoint: string, method: string, duration: number, status: number) {
    this.recordMetric(`api_${method.toLowerCase()}_${endpoint.replace(/\//g, "_")}`, duration, "ms")
  }

  private async sendMetric(metric: PerformanceMetric) {
    if (!this.isEnabled) return

    try {
      // In production, send to monitoring service like:
      // - Vercel Analytics
      // - DataDog
      // - New Relic
      // - Custom monitoring endpoint
      console.log("[Performance] Metric recorded:", metric)
    } catch (error) {
      console.error("[Performance] Failed to send metric:", error)
    }
  }

  // Get performance summary
  getMetricsSummary() {
    const summary: Record<string, { avg: number; min: number; max: number; count: number }> = {}

    this.metrics.forEach((metric) => {
      if (!summary[metric.name]) {
        summary[metric.name] = { avg: 0, min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY, count: 0 }
      }

      const s = summary[metric.name]
      s.count++
      s.min = Math.min(s.min, metric.value)
      s.max = Math.max(s.max, metric.value)
      s.avg = (s.avg * (s.count - 1) + metric.value) / s.count
    })

    return summary
  }
}

export const performanceMonitor = new PerformanceMonitor()

// React hook for performance monitoring
export function usePerformanceMonitor() {
  return {
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
    measureAsync: performanceMonitor.measureAsync.bind(performanceMonitor),
    measureSync: performanceMonitor.measureSync.bind(performanceMonitor),
    recordDatabaseQuery: performanceMonitor.recordDatabaseQuery.bind(performanceMonitor),
    recordApiCall: performanceMonitor.recordApiCall.bind(performanceMonitor),
  }
}
