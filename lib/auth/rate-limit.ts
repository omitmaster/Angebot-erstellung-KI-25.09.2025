interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

class RateLimiter {
  private store: RateLimitStore = {}
  private windowMs: number
  private maxRequests: number

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests = 5) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  check(identifier: string): { allowed: boolean; resetTime?: number } {
    const now = Date.now()
    const key = identifier

    // Clean up expired entries
    if (this.store[key] && now > this.store[key].resetTime) {
      delete this.store[key]
    }

    // Initialize or get current state
    if (!this.store[key]) {
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs,
      }
      return { allowed: true }
    }

    // Check if limit exceeded
    if (this.store[key].count >= this.maxRequests) {
      return {
        allowed: false,
        resetTime: this.store[key].resetTime,
      }
    }

    // Increment counter
    this.store[key].count++
    return { allowed: true }
  }

  reset(identifier: string) {
    delete this.store[identifier]
  }
}

// Create rate limiters for different auth actions
export const loginRateLimit = new RateLimiter(15 * 60 * 1000, 5) // 5 attempts per 15 minutes
export const registerRateLimit = new RateLimiter(60 * 60 * 1000, 3) // 3 attempts per hour
export const passwordResetRateLimit = new RateLimiter(60 * 60 * 1000, 2) // 2 attempts per hour

export function getRateLimitKey(ip: string, action: string): string {
  return `${action}:${ip}`
}

export function checkRateLimit(identifier: string, limiter: RateLimiter): { allowed: boolean; resetTime?: number } {
  return limiter.check(identifier)
}
