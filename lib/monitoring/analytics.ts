interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  userId?: string
  timestamp?: string
}

interface UserProperties {
  userId: string
  email?: string
  userType?: "handwerker" | "kunde"
  plan?: string
  [key: string]: any
}

class Analytics {
  private isEnabled: boolean
  private userId?: string
  private userProperties: Record<string, any> = {}

  constructor() {
    this.isEnabled = typeof window !== "undefined" && process.env.NODE_ENV === "production"
  }

  // Initialize analytics with user data
  identify(userId: string, properties: UserProperties) {
    this.userId = userId
    this.userProperties = properties

    if (this.isEnabled) {
      // In production, you would integrate with services like:
      // - Vercel Analytics
      // - PostHog
      // - Mixpanel
      // - Google Analytics 4
      console.log("[Analytics] User identified:", { userId, properties })
    }
  }

  // Track events
  track(event: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return

    const eventData: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        ...this.userProperties,
        timestamp: new Date().toISOString(),
        url: typeof window !== "undefined" ? window.location.href : undefined,
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      },
      userId: this.userId,
      timestamp: new Date().toISOString(),
    }

    // Send to analytics service
    this.sendEvent(eventData)
  }

  // Track page views
  page(pageName?: string, properties?: Record<string, any>) {
    this.track("Page Viewed", {
      page: pageName || (typeof window !== "undefined" ? window.location.pathname : undefined),
      ...properties,
    })
  }

  // Business-specific events
  trackUserRegistration(userType: "handwerker" | "kunde", method = "email") {
    this.track("User Registered", {
      userType,
      method,
      category: "auth",
    })
  }

  trackProjectCreated(projectData: { title: string; category?: string }) {
    this.track("Project Created", {
      ...projectData,
      category: "project",
    })
  }

  trackOfferSent(offerData: { projectId: string; total: number; currency: string }) {
    this.track("Offer Sent", {
      ...offerData,
      category: "offer",
    })
  }

  trackOfferAccepted(offerData: { projectId: string; total: number; currency: string }) {
    this.track("Offer Accepted", {
      ...offerData,
      category: "offer",
    })
  }

  trackPaymentCompleted(paymentData: { amount: number; currency: string; method: string }) {
    this.track("Payment Completed", {
      ...paymentData,
      category: "payment",
    })
  }

  trackError(error: Error, context?: Record<string, any>) {
    this.track("Error Occurred", {
      error: error.message,
      stack: error.stack,
      context,
      category: "error",
    })
  }

  private async sendEvent(eventData: AnalyticsEvent) {
    try {
      // In production, send to your analytics service
      // Example for Vercel Analytics:
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(eventData)
      // })

      console.log("[Analytics] Event tracked:", eventData)
    } catch (error) {
      console.error("[Analytics] Failed to send event:", error)
    }
  }
}

export const analytics = new Analytics()

// React hook for analytics
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    page: analytics.page.bind(analytics),
    identify: analytics.identify.bind(analytics),
    trackUserRegistration: analytics.trackUserRegistration.bind(analytics),
    trackProjectCreated: analytics.trackProjectCreated.bind(analytics),
    trackOfferSent: analytics.trackOfferSent.bind(analytics),
    trackOfferAccepted: analytics.trackOfferAccepted.bind(analytics),
    trackPaymentCompleted: analytics.trackPaymentCompleted.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
  }
}
