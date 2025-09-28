"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Inbox, FileText, Calculator, TrendingUp, CheckCircle, FolderOpen, Building2, Home } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth/client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Dashboard() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lädt...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const displayName =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile?.first_name || user?.email?.split("@")[0] || "Benutzer"

  const isHandwerker = profile?.role === "handwerker"
  const projectsCount = 0 // Will be fetched from database later
  const offersCount = 0 // Will be fetched from database later

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-lg font-semibold text-foreground">Dashboard</span>
            </div>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Startseite
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Willkommen zurück, {displayName}!</h1>
          <p className="text-muted-foreground">
            {isHandwerker
              ? "Hier ist eine Übersicht über Ihre aktuellen Aufträge und Anfragen."
              : "Hier ist eine Übersicht über Ihre Projekte und Handwerker-Suchen."}
          </p>
          <Badge variant={isHandwerker ? "default" : "secondary"} className="mt-2">
            {isHandwerker ? "Handwerker" : "Kunde"}
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isHandwerker ? "Offene Anfragen" : "Meine Projekte"}
              </CardTitle>
              <Inbox className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectsCount}</div>
              <p className="text-xs text-muted-foreground">Aktuelle Projekte</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isHandwerker ? "Angebote erstellt" : "Erhaltene Angebote"}
              </CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{offersCount}</div>
              <p className="text-xs text-muted-foreground">Gesamt</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isHandwerker ? "Umsatz (Monat)" : "Ausgaben (Monat)"}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€0</div>
              <p className="text-xs text-muted-foreground">Noch keine Daten</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{isHandwerker ? "Erfolgsquote" : "Bewertung"}</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isHandwerker ? "0%" : "0"}</div>
              <p className="text-xs text-muted-foreground">
                {isHandwerker ? "Noch keine Angebote" : "Noch keine Bewertungen"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Schnellzugriff</CardTitle>
              <CardDescription>Die wichtigsten Funktionen auf einen Blick</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button asChild className="h-20 flex-col gap-2">
                  <Link href="/lv-analyse">
                    <FileText className="h-6 w-6" />
                    LV-Analyse
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <Link href="/ai-angebots-generator">
                    <Calculator className="h-6 w-6" />
                    KI-Angebot
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <Link href="/preisdatenbank">
                    <TrendingUp className="h-6 w-6" />
                    Preisdatenbank
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <Link href="/documents">
                    <FolderOpen className="h-6 w-6" />
                    Dokumente
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Erste Schritte</CardTitle>
              <CardDescription>So nutzen Sie die App optimal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium">LV-Dokument analysieren</p>
                    <p className="text-xs text-muted-foreground">
                      Laden Sie Ihr Leistungsverzeichnis hoch und lassen Sie es von der KI analysieren.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium">Angebot generieren</p>
                    <p className="text-xs text-muted-foreground">
                      Nutzen Sie den KI-Angebots-Generator für präzise Kalkulationen.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium">Preise verwalten</p>
                    <p className="text-xs text-muted-foreground">
                      Pflegen Sie Ihre Preisdatenbank für zukünftige Projekte.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
