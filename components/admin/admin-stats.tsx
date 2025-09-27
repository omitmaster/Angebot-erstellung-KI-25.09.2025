"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, CreditCard, Star, TrendingUp, AlertCircle } from "lucide-react"

interface DashboardStats {
  total_users: number
  total_handwerker: number
  total_customers: number
  total_jobs: number
  active_jobs: number
  completed_jobs: number
  total_payments: number
  pending_payments: number
  total_reviews: number
  pending_disputes: number
}

export function AdminStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc("get_admin_dashboard_stats")

      if (error) throw error
      if (data && data.length > 0) {
        setStats(data[0])
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Fehler beim Laden der Statistiken</p>
        </CardContent>
      </Card>
    )
  }

  const statCards = [
    {
      title: "Gesamte Benutzer",
      value: stats.total_users.toLocaleString(),
      description: `${stats.total_handwerker} Handwerker, ${stats.total_customers} Kunden`,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Aufträge",
      value: stats.total_jobs.toLocaleString(),
      description: `${stats.active_jobs} aktiv, ${stats.completed_jobs} abgeschlossen`,
      icon: Briefcase,
      color: "text-green-600",
    },
    {
      title: "Zahlungsvolumen",
      value: `€${stats.total_payments.toLocaleString()}`,
      description: `${stats.pending_payments} ausstehende Zahlungen`,
      icon: CreditCard,
      color: "text-purple-600",
    },
    {
      title: "Bewertungen",
      value: stats.total_reviews.toLocaleString(),
      description: "Öffentliche Bewertungen",
      icon: Star,
      color: "text-yellow-600",
    },
    {
      title: "Erfolgsrate",
      value: `${stats.total_jobs > 0 ? Math.round((stats.completed_jobs / stats.total_jobs) * 100) : 0}%`,
      description: "Abgeschlossene Aufträge",
      icon: TrendingUp,
      color: "text-emerald-600",
    },
    {
      title: "Streitigkeiten",
      value: stats.pending_disputes.toLocaleString(),
      description: "Offene Zahlungsstreitigkeiten",
      icon: AlertCircle,
      color: stats.pending_disputes > 0 ? "text-red-600" : "text-gray-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Schnellaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium">Neue Benutzer</h3>
              <p className="text-sm text-muted-foreground">Benutzer verwalten</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <h3 className="font-medium">Streitigkeiten</h3>
              <p className="text-sm text-muted-foreground">Offene Fälle bearbeiten</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium">Berichte</h3>
              <p className="text-sm text-muted-foreground">Detaillierte Analysen</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
