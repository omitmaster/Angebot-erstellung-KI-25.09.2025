import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Calculator, FileText, Database, Sparkles } from "lucide-react"
import { HomepageLogin } from "@/components/auth/homepage-login"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-foreground">Angebots- &</span>
                <span className="text-lg font-semibold text-foreground">Prozessmeister</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild variant="outline">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild>
                <Link href="/demo">Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Handwerk Business Management System
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                Optimieren Sie Ihre Angebotserstellung, Preiskalkulation und Projektabwicklung mit KI-gestützten Tools
                für das moderne Handwerk.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link href="/dashboard">Jetzt starten</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
                  <Link href="/demo">Demo ansehen</Link>
                </Button>
              </div>
            </div>

            {/* Right side - Login */}
            <div className="flex justify-center lg:justify-end">
              <HomepageLogin />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Alles was Sie für Ihr Handwerk brauchen
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <FileText className="h-12 w-12 text-primary mb-4" />
                <CardTitle>LV-Analyse</CardTitle>
                <CardDescription>Automatische Analyse von Leistungsverzeichnissen mit KI-Unterstützung</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Laden Sie Ihre LV-Dokumente hoch und lassen Sie sie intelligent analysieren und strukturieren.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Sparkles className="h-12 w-12 text-primary mb-4" />
                <CardTitle>KI-Angebots-Generator</CardTitle>
                <CardDescription>Präzise Angebote mit künstlicher Intelligenz erstellen</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generieren Sie professionelle Angebote basierend auf Ihren Projektdaten und Erfahrungswerten.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Calculator className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Angebots-Builder</CardTitle>
                <CardDescription>Interaktive Angebotserstellung mit Echtzeit-Kalkulation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Erstellen Sie detaillierte Angebote mit automatischer Preisberechnung und Materialplanung.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Database className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Preisdatenbank</CardTitle>
                <CardDescription>Umfangreiche Datenbank mit aktuellen Marktpreisen</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Zugriff auf aktuelle Preise für Materialien, Arbeitszeiten und Dienstleistungen.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Dokumentenverwaltung</CardTitle>
                <CardDescription>Zentrale Verwaltung aller Projektdokumente</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Organisieren Sie Verträge, Rechnungen und Projektunterlagen an einem Ort.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Building2 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Projektmanagement</CardTitle>
                <CardDescription>Vollständige Übersicht über alle Ihre Projekte</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Verwalten Sie Termine, Aufgaben und Kommunikation für alle Ihre Handwerksprojekte.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Bereit für effizienteres Arbeiten?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Starten Sie noch heute und optimieren Sie Ihre Handwerksprozesse mit modernster Technologie.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/dashboard">Jetzt starten</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">© 2025 Angebots- & Prozessmeister. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  )
}
