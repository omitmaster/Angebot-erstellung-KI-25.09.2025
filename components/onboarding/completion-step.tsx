"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight, Hammer, Users, Building, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAnalytics } from "@/lib/monitoring/analytics"
import { ProfileService } from "@/lib/database/profiles"
import { useAuth } from "@/lib/auth/hooks"

interface CompletionStepProps {
  onNext: () => void
  onBack: () => void
  data: any
  setData: (data: any) => void
}

export function CompletionStep({ data }: CompletionStepProps) {
  const router = useRouter()
  const { track } = useAnalytics()
  const { user } = useAuth()
  const [isCreating, setIsCreating] = useState(false)

  const handleComplete = async () => {
    if (!user) return

    setIsCreating(true)
    try {
      // Create user profile
      await ProfileService.createProfile(user.id, {
        user_type: data.userType,
        first_name: data.profile.firstName,
        last_name: data.profile.lastName,
        phone: data.profile.phone,
        address: data.profile.address,
        city: data.profile.city,
        postal_code: data.profile.postalCode,
        description: data.profile.description,
        company_name: data.business.companyName,
        website: data.business.website,
      })

      track("Onboarding Completed", {
        userType: data.userType,
        hasBusinessInfo: !!data.business.companyName,
        completedSteps: 5,
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to complete onboarding:", error)
      // Handle error - show toast or error message
    } finally {
      setIsCreating(false)
    }
  }

  const completedSteps = [
    {
      icon: Hammer,
      title: "Benutzertyp",
      description: data.userType === "handwerker" ? "Handwerker" : "Kunde",
    },
    {
      icon: Users,
      title: "Profil",
      description: `${data.profile.firstName} ${data.profile.lastName}`,
    },
    {
      icon: Building,
      title: "Geschäft",
      description: data.business.companyName || "Übersprungen",
    },
    {
      icon: Settings,
      title: "Einstellungen",
      description: "Konfiguriert",
    },
  ]

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl">Alles eingerichtet!</CardTitle>
        <CardDescription className="text-lg">
          Ihr Konto ist bereit. Hier ist eine Zusammenfassung Ihrer Einstellungen:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {completedSteps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{step.title}</div>
                  <div className="text-sm text-muted-foreground">{step.description}</div>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            )
          })}
        </div>

        <div className="bg-primary/5 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Nächste Schritte:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {data.userType === "handwerker" ? (
              <>
                <li>• Vervollständigen Sie Ihr Profil im Dashboard</li>
                <li>• Laden Sie Referenzbilder hoch</li>
                <li>• Erstellen Sie Ihr erstes Projekt</li>
                <li>• Erkunden Sie die Angebotserstellung</li>
              </>
            ) : (
              <>
                <li>• Durchsuchen Sie verfügbare Handwerker</li>
                <li>• Erstellen Sie Ihre erste Anfrage</li>
                <li>• Verwalten Sie Ihre Projekte</li>
                <li>• Bewerten Sie abgeschlossene Arbeiten</li>
              </>
            )}
          </ul>
        </div>

        <div className="text-center">
          <Button onClick={handleComplete} disabled={isCreating} size="lg" className="min-w-48">
            {isCreating ? "Wird erstellt..." : "Zum Dashboard"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
