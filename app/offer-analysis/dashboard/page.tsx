"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, TrendingUp, Database, CheckCircle, AlertCircle, Clock, BarChart3 } from "lucide-react"
import Link from "next/link"

interface UploadedOffer {
  id: string
  filename: string
  analysis_status: string
  upload_date: string
  total_amount: number
  analyzed_positions: number
  total_positions: number
  competitive_score: number
  data_quality_score: number
}

interface SystemStats {
  total_offers: number
  processed_offers: number
  total_positions: number
  price_updates_pending: number
  average_quality_score: number
  market_coverage_pct: number
}

export default function OfferAnalysisDashboard() {
  const [offers, setOffers] = useState<UploadedOffer[]>([])
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [offersRes, statsRes] = await Promise.all([
        fetch("/api/offer-analysis/offers"),
        fetch("/api/offer-analysis/stats"),
      ])

      const offersData = await offersRes.json()
      const statsData = await statsRes.json()

      setOffers(offersData)
      setStats(statsData)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "processing":
        return "bg-blue-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "processing":
        return <Clock className="h-4 w-4" />
      case "failed":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Angebots-Analyse Dashboard</h1>
          <p className="text-muted-foreground">
            Verwalten Sie hochgeladene Angebote und überwachen Sie die Preisanalyse
          </p>
        </div>
        <Link href="/offer-analysis">
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Neues Angebot hochladen
          </Button>
        </Link>
      </div>

      {/* System Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamt Angebote</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_offers}</div>
              <p className="text-xs text-muted-foreground">{stats.processed_offers} verarbeitet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analysierte Positionen</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_positions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Preisdaten extrahiert</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Datenqualität</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.average_quality_score * 100)}%</div>
              <Progress value={stats.average_quality_score * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preisabgleich</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.price_updates_pending}</div>
              <p className="text-xs text-muted-foreground">Ausstehende Updates</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="offers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="offers">Hochgeladene Angebote</TabsTrigger>
          <TabsTrigger value="analysis">Analyse-Ergebnisse</TabsTrigger>
          <TabsTrigger value="prices">Preisdatenbank</TabsTrigger>
        </TabsList>

        <TabsContent value="offers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Angebots-Übersicht</CardTitle>
              <CardDescription>Status und Fortschritt aller hochgeladenen Angebote</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {offers.map((offer) => (
                  <div key={offer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(offer.analysis_status)}`} />
                      <div>
                        <h3 className="font-medium">{offer.filename}</h3>
                        <p className="text-sm text-muted-foreground">
                          Hochgeladen: {new Date(offer.upload_date).toLocaleDateString("de-DE")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {offer.total_amount?.toLocaleString("de-DE", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {offer.analyzed_positions}/{offer.total_positions} Positionen
                        </p>
                      </div>

                      <Badge variant="outline" className="flex items-center space-x-1">
                        {getStatusIcon(offer.analysis_status)}
                        <span className="capitalize">{offer.analysis_status}</span>
                      </Badge>

                      {offer.analysis_status === "completed" && (
                        <div className="flex space-x-2">
                          <Badge variant="secondary">Qualität: {Math.round(offer.data_quality_score * 100)}%</Badge>
                          <Badge variant="secondary">Wettbewerb: {Math.round(offer.competitive_score * 100)}%</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {offers.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Keine Angebote vorhanden</h3>
                    <p className="text-muted-foreground mb-4">
                      Laden Sie Ihr erstes Angebot hoch, um mit der Analyse zu beginnen.
                    </p>
                    <Link href="/offer-analysis">
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Angebot hochladen
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyse-Ergebnisse</CardTitle>
              <CardDescription>Detaillierte Einblicke in die Preisanalyse</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Analyse-Dashboard</h3>
                <p className="text-muted-foreground">Detaillierte Analyse-Ergebnisse werden hier angezeigt.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preisdatenbank</CardTitle>
              <CardDescription>Verwaltung der extrahierten Preisdaten</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Preisdatenbank-Verwaltung</h3>
                <p className="text-muted-foreground">Preisdaten-Management wird hier implementiert.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
