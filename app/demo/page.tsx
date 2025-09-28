import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, ArrowLeft } from "lucide-react"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-accent" />
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-foreground">Angebots- &</span>
                <span className="text-lg font-semibold text-foreground">Prozessmeister</span>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Demo</h1>
          <p className="text-xl text-muted-foreground">
            Erleben Sie die Funktionen unserer Handwerk-Management-Software
          </p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Demo-Zugang</CardTitle>
            <CardDescription>
              Die Demo-Funktionen sind derzeit in Entwicklung. Registrieren Sie sich für den vollen Zugang.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-8">
              Unsere Demo wird bald verfügbar sein. In der Zwischenzeit können Sie sich registrieren, um Zugang zu allen
              Funktionen zu erhalten.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/auth/sign-up">Jetzt registrieren</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/login">Bereits registriert? Anmelden</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
