"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, ArrowLeft, Building } from "lucide-react"
import { useState } from "react"

interface BusinessSetupStepProps {
  onNext: () => void
  onBack: () => void
  data: any
  setData: (data: any) => void
}

const tradeCategories = [
  { value: "elektrik", label: "Elektrik" },
  { value: "sanitaer", label: "Sanitär" },
  { value: "heizung", label: "Heizung" },
  { value: "maler", label: "Maler" },
  { value: "tischler", label: "Tischler" },
  { value: "maurer", label: "Maurer" },
  { value: "dachdecker", label: "Dachdecker" },
  { value: "garten", label: "Garten- und Landschaftsbau" },
  { value: "allgemein", label: "Allgemeine Handwerksarbeiten" },
]

export function BusinessSetupStep({ onNext, onBack, data, setData }: BusinessSetupStepProps) {
  const [business, setBusiness] = useState(
    data.business || {
      companyName: "",
      tradeCategory: "",
      licenseNumber: "",
      experienceYears: "",
      serviceRadius: "50",
      hourlyRateMin: "35",
      hourlyRateMax: "65",
      availableForEmergency: false,
      website: "",
    },
  )

  const handleNext = () => {
    if (data.userType === "kunde" || (business.companyName && business.tradeCategory)) {
      setData({ business })
      onNext()
    }
  }

  const updateBusiness = (field: string, value: string | boolean) => {
    setBusiness((prev: any) => ({ ...prev, [field]: value }))
  }

  const isValid = data.userType === "kunde" || (business.companyName && business.tradeCategory)

  if (data.userType === "kunde") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Building className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Geschäftsdaten</CardTitle>
              <CardDescription>Als Kunde können Sie diesen Schritt überspringen</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-6">
              Als Kunde benötigen wir keine weiteren Geschäftsdaten von Ihnen.
            </p>
            <div className="flex justify-between">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
              <Button onClick={handleNext}>
                Weiter
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Building className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Geschäftsdaten</CardTitle>
            <CardDescription>Informationen zu Ihrem Handwerksbetrieb</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="companyName">Firmenname *</Label>
          <Input
            id="companyName"
            value={business.companyName}
            onChange={(e) => updateBusiness("companyName", e.target.value)}
            placeholder="Mustermann Handwerk GmbH"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tradeCategory">Gewerke *</Label>
          <Select value={business.tradeCategory} onValueChange={(value) => updateBusiness("tradeCategory", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Wählen Sie Ihr Hauptgewerke" />
            </SelectTrigger>
            <SelectContent>
              {tradeCategories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="experienceYears">Berufserfahrung (Jahre)</Label>
            <Input
              id="experienceYears"
              type="number"
              value={business.experienceYears}
              onChange={(e) => updateBusiness("experienceYears", e.target.value)}
              placeholder="10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="serviceRadius">Einsatzradius (km)</Label>
            <Input
              id="serviceRadius"
              type="number"
              value={business.serviceRadius}
              onChange={(e) => updateBusiness("serviceRadius", e.target.value)}
              placeholder="50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Stundensatz (EUR)</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hourlyRateMin" className="text-sm text-muted-foreground">
                Von
              </Label>
              <Input
                id="hourlyRateMin"
                type="number"
                value={business.hourlyRateMin}
                onChange={(e) => updateBusiness("hourlyRateMin", e.target.value)}
                placeholder="35"
              />
            </div>
            <div>
              <Label htmlFor="hourlyRateMax" className="text-sm text-muted-foreground">
                Bis
              </Label>
              <Input
                id="hourlyRateMax"
                type="number"
                value={business.hourlyRateMax}
                onChange={(e) => updateBusiness("hourlyRateMax", e.target.value)}
                placeholder="65"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenseNumber">Handwerksnummer (optional)</Label>
          <Input
            id="licenseNumber"
            value={business.licenseNumber}
            onChange={(e) => updateBusiness("licenseNumber", e.target.value)}
            placeholder="HWK123456"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website (optional)</Label>
          <Input
            id="website"
            type="url"
            value={business.website}
            onChange={(e) => updateBusiness("website", e.target.value)}
            placeholder="https://www.ihr-handwerk.de"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="availableForEmergency"
            checked={business.availableForEmergency}
            onCheckedChange={(checked) => updateBusiness("availableForEmergency", checked)}
          />
          <Label htmlFor="availableForEmergency">Verfügbar für Notfälle</Label>
        </div>

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
