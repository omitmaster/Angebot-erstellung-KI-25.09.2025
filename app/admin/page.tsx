"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  AlertTriangle,
  Users,
  Building2,
  FileText,
  Settings,
  Search,
  Filter,
  ChevronRight,
  TrendingUp,
  Activity,
  Database,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
    checkAdminAccess()
    fetchDashboardStats()
  }, [])

  const checkAdminAccess = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // For demo purposes, we'll check if user exists in users table with admin role
      const { data: userProfile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .eq("role", "admin")
        .single()

      if (!userProfile) {
        router.push("/dashboard")
        return
      }

      setCurrentUser({ ...user, profile: userProfile })
      setIsAdmin(true)
    } catch (error) {
      console.error("Error checking admin access:", error)
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const fetchDashboardStats = async () => {
    try {
      // Fetch real stats from database
      const [
        { count: totalUsers },
        { count: totalProjects },
        { count: totalOffers },
        { count: totalCustomers },
        { count: totalContracts },
      ] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("offers").select("*", { count: "exact", head: true }),
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase.from("contracts").select("*", { count: "exact", head: true }),
      ])

      setStats({
        totalUsers: totalUsers || 0,
        totalProjects: totalProjects || 0,
        totalOffers: totalOffers || 0,
        totalCustomers: totalCustomers || 0,
        totalContracts: totalContracts || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="border-b border-zinc-800 bg-zinc-900/50">
          <div className="container mx-auto px-6 py-4">
            <div className="animate-pulse">
              <div className="h-8 bg-zinc-800 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-zinc-900/50 border border-zinc-800 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Card className="w-full max-w-md bg-zinc-900/50 border-zinc-800">
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-semibold mb-2 text-white">Zugriff verweigert</h2>
            <p className="text-zinc-400 mb-4">Sie haben keine Berechtigung für das Admin-Dashboard.</p>
            <Button onClick={() => router.push("/dashboard")} className="bg-green-600 hover:bg-green-700">
              Zurück zum Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statCards = [
    {
      title: "Benutzer",
      value: stats?.totalUsers || 0,
      description: "Registrierte Benutzer",
      icon: Users,
      trend: "+12%",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Projekte",
      value: stats?.totalProjects || 0,
      description: "Aktive Projekte",
      icon: Building2,
      trend: "+8%",
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Angebote",
      value: stats?.totalOffers || 0,
      description: "Erstellte Angebote",
      icon: FileText,
      trend: "+15%",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Kunden",
      value: stats?.totalCustomers || 0,
      description: "Registrierte Kunden",
      icon: Users,
      trend: "+5%",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
    },
  ]

  const quickActions = [
    {
      title: "Benutzerverwaltung",
      description: "Benutzer und Rollen verwalten",
      icon: Users,
      href: "/admin/users",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Projektverwaltung",
      description: "Projekte überwachen und verwalten",
      icon: Building2,
      href: "/admin/projects",
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Angebote & Verträge",
      description: "Angebote und Verträge verwalten",
      icon: FileText,
      href: "/admin/offers",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Systemeinstellungen",
      description: "Konfiguration und Einstellungen",
      icon: Settings,
      href: "/admin/settings",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                <Shield className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-zinc-400 mt-1">Willkommen, {currentUser?.profile?.name || currentUser?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700"
              >
                <Search className="h-4 w-4 mr-2" />
                Suchen
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <Card key={index} className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-zinc-400">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">{stat.value.toLocaleString()}</div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-zinc-500">{stat.description}</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-green-400 font-medium">{stat.trend}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-xl">Schnellaktionen</CardTitle>
                <p className="text-zinc-400 text-sm">Häufig verwendete Verwaltungsfunktionen</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <div
                      key={index}
                      className="group p-6 border border-zinc-800 rounded-xl hover:bg-zinc-800/50 cursor-pointer transition-all duration-200 hover:border-zinc-700"
                      onClick={() => router.push(action.href)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${action.bgColor}`}>
                          <action.icon className={`h-6 w-6 ${action.color}`} />
                        </div>
                        <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                      </div>
                      <h3 className="font-semibold text-white mb-2">{action.title}</h3>
                      <p className="text-sm text-zinc-400">{action.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-400" />
                  Systemstatus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-white">Datenbank</span>
                  </div>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-white">API</span>
                  </div>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Aktiv</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-white">Backup</span>
                  </div>
                  <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Läuft</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-400" />
                  Letzte Aktivitäten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">Neuer Benutzer registriert</p>
                    <p className="text-xs text-zinc-500">vor 2 Minuten</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">Projekt erstellt</p>
                    <p className="text-xs text-zinc-500">vor 15 Minuten</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">Angebot generiert</p>
                    <p className="text-xs text-zinc-500">vor 1 Stunde</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">System-Backup abgeschlossen</p>
                    <p className="text-xs text-zinc-500">vor 3 Stunden</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
