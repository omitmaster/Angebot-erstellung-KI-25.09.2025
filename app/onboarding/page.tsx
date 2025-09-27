"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Hammer, User, Building, MapPin, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth/hooks"
import { useAnalytics } from "@/lib/monitoring/analytics"
import { ProfileSetupStep } from "@/components/onboarding/profile-setup-step"
import { BusinessSetupStep } from "@/components/onboarding/business-setup-step"
import { PreferencesStep } from "@/components/onboarding/preferences-step"
import { WelcomeStep } from "@/components/onboarding/welcome-step"
import { CompletionStep } from "@/components/onboarding/completion-step"

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  component: React.ComponentType<{ onNext: () => void; onBack: () => void; data: any; setData: (data: any) => void }>
  required: boolean
}

export default function OnboardingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { track } = useAnalytics()
  const [currentStep, setCurrentStep] = useState(0)
  const [onboardingData, setOnboardingData] = useState({
    userType: "",
    profile: {},
    business: {},
    preferences: {},
  })

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Willkommen",
      description: "Lassen Sie uns beginnen",
      icon: Hammer,
      component: WelcomeStep,
      required: true,
    },
    {
      id: "profile",
      title: "Profil einrichten",
      description: "Ihre persönlichen Daten",
      icon: User,
      component: ProfileSetupStep,
      required: true,
    },
    {
      id: "business",
      title: "Geschäftsdaten",
      description: "Ihr Unternehmen",
      icon: Building,
      component: BusinessSetupStep,
      required: true,
    },
    {
      id: "preferences",
      title: "Einstellungen",
      description: "Ihre Präferenzen",
      icon: MapPin,
      component: PreferencesStep,
      required: false,
    },
    {
      id: "completion",
      title: "Fertig!",
      description: "Alles eingerichtet",
      icon: CheckCircle,
      component: CompletionStep,
      required: true,
    },
  ]

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      track("Onboarding Started", {
        userId: user.id,
        userType: user.user_metadata?.user_type,
      })
    }
  }, [user, track])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      track("Onboarding Step Completed", {
        step: steps[currentStep].id,
        stepNumber: currentStep + 1,
      })
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateOnboardingData = (stepData: any) => {
    setOnboardingData((prev) => ({
      ...prev,
      ...stepData,
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Hammer className="h-8 w-8 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    )
  }

  const CurrentStepComponent = steps[currentStep].component
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hammer className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">HandwerkApp Setup</h1>
            </div>
            <Badge variant="secondary">
              Schritt {currentStep + 1} von {steps.length}
            </Badge>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-4 overflow-x-auto">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep
              const isAccessible = index <= currentStep

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                        ? "bg-green-100 text-green-700"
                        : isAccessible
                          ? "bg-muted text-muted-foreground"
                          : "bg-muted/50 text-muted-foreground/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium whitespace-nowrap">{step.title}</span>
                  {isCompleted && <CheckCircle className="h-4 w-4" />}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <CurrentStepComponent
            onNext={handleNext}
            onBack={handleBack}
            data={onboardingData}
            setData={updateOnboardingData}
          />
        </div>
      </div>
    </div>
  )
}
