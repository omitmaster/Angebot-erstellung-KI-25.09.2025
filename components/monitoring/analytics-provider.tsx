"use client"

import { createContext, useContext, useEffect, type ReactNode } from "react"
import { analytics } from "@/lib/monitoring/analytics"
import { performanceMonitor } from "@/lib/monitoring/performance"
import { useAuth } from "@/lib/auth/hooks"
import { usePathname } from "next/navigation"

interface AnalyticsContextType {
  track: typeof analytics.track
  page: typeof analytics.page
  trackError: typeof analytics.trackError
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null)

interface AnalyticsProviderProps {
  children: ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const { user } = useAuth()
  const pathname = usePathname()

  // Initialize analytics with user data
  useEffect(() => {
    if (user) {
      analytics.identify(user.id, {
        userId: user.id,
        email: user.email,
        userType: user.user_metadata?.user_type,
      })

      performanceMonitor.setUserId(user.id)
    }
  }, [user])

  // Track page views
  useEffect(() => {
    analytics.page(pathname)
  }, [pathname])

  const contextValue: AnalyticsContextType = {
    track: analytics.track.bind(analytics),
    page: analytics.page.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
  }

  return <AnalyticsContext.Provider value={contextValue}>{children}</AnalyticsContext.Provider>
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error("useAnalyticsContext must be used within an AnalyticsProvider")
  }
  return context
}
