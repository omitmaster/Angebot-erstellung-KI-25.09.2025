"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, ArrowLeft, User } from "lucide-react"
import { useState } from "react"

interface ProfileSetupStepProps {
  onNext: () => void
  onBack: () => void
  data: any
  setData: (data: any) => void
}

export function ProfileSetupStep({ onNext, onBack, data, setData }: ProfileSetupStepProps) {
  const [profile, setProfile] = useState(
    data.profile || {
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      description: "",
    },
  )

  const handleNext = () => {
    if (profile.firstName && profile.lastName && profile.phone) {
      setData({ profile })
      onNext()
    }
  }

  const updateProfile = (field: string, value: string) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }))
  }

  const isValid = profile.firstName && profile.lastName && profile.phone

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Profil einrichten</CardTitle>
            <CardDescription>Erzählen Sie uns etwas über sich</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Vorname *</Label>
            <Input
              id="firstName"
              value={profile.firstName}
              onChange={(e) => updateProfile("firstName", e.target.value)}
              placeholder="Max"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nachname *</Label>
            <Input
              id="lastName"
              value={profile.lastName}
              onChange={(e) => updateProfile("lastName", e.target.value)}
              placeholder="Mustermann"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefonnummer *</Label>
          <Input
            id="phone"
            type="tel"
            value={profile.phone}
            onChange={(e) => updateProfile("phone", e.target.value)}
            placeholder="+49 123 456789"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            value={profile.address}
            onChange={(e) => updateProfile("address", e.target.value)}
            placeholder="Musterstraße 123"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="postalCode">PLZ</Label>
            <Input
              id="postalCode"
              value={profile.postalCode}
              onChange={(e) => updateProfile("postalCode", e.target.value)}
              placeholder="12345"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Stadt</Label>
            <Input
              id="city"
              value={profile.city}
              onChange={(e) => updateProfile("city", e.target.value)}
              placeholder="Berlin"
            />
          </div>
        </div>

        {data.userType === "handwerker" && (
          <div className="space-y-2">
            <Label htmlFor="description">Kurze Beschreibung</Label>
            <Textarea
              id="description"
              value={profile.description}
              onChange={(e) => updateProfile("description", e.target.value)}
              placeholder="Beschreiben Sie Ihre Erfahrung und Spezialisierung..."
              rows={3}
            />
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>
          <Button onClick={handleNext} disabled={!isValid}>
            Weiter
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
