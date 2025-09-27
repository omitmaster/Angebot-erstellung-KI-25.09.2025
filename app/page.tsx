import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Inbox, FileText, Calculator, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <Header />

        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Willkommen zurück, Hans!</h1>
            <p className="text-muted-foreground">Hier ist eine Übersicht über Ihre aktuellen Projekte und Aufgaben.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Offene Anfragen</CardTitle>
                <Inbox className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+3 seit gestern</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Angebote erstellt</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Diese Woche</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Umsatz (Monat)</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€45.230</div>
                <p className="text-xs text-muted-foreground">+12% zum Vormonat</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Erfolgsquote</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68%</div>
                <p className="text-xs text-muted-foreground">Angebote → Aufträge</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Aktuelle Aktivitäten</CardTitle>
                <CardDescription>Die neuesten Ereignisse in Ihren Projekten</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Neues LV von Müller GmbH erhalten</p>
                    <p className="text-xs text-muted-foreground">vor 2 Stunden</p>
                  </div>
                  <Badge variant="secondary">Neu</Badge>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Angebot #2024-015 versendet</p>
                    <p className="text-xs text-muted-foreground">vor 4 Stunden</p>
                  </div>
                  <Badge variant="outline">Versendet</Badge>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Vertrag von Schmidt & Co. unterschrieben</p>
                    <p className="text-xs text-muted-foreground">gestern</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Abgeschlossen</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Anstehende Aufgaben</CardTitle>
                <CardDescription>Was heute noch zu erledigen ist</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Follow-up für Angebot #2024-012</p>
                    <p className="text-xs text-muted-foreground">Fällig heute</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Erledigen
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">LV-Analyse für Projekt Neubau</p>
                    <p className="text-xs text-muted-foreground">Fällig morgen</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Starten
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Materialbestellung prüfen</p>
                    <p className="text-xs text-muted-foreground">Überfällig</p>
                  </div>
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                    Dringend
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
