"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, ArrowLeft, Settings } from "lucide-react"
import { useState } from "react"

interface PreferencesStepProps {
  onNext: () => void
  onBack: () => void
  data: any
  setData: (data: any) => void
}

export function PreferencesStep({ onNext, onBack, data, setData }: PreferencesStepProps) {
  const [preferences, setPreferences] = useState(
    data.preferences || {
      preferredContactMethod: "email",
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: false,
      language: "de",
      timezone: "Europe/Berlin",
    },
  )

  const handleNext = () => {
    setData({ preferences })
    onNext()
  }

  const updatePreferences = (field: string, value: string | boolean) => {
    setPreferences((prev: any) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Einstellungen</CardTitle>
            <CardDescription>Passen Sie Ihre Präferenzen an</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="preferredContactMethod">Bevorzugte Kontaktmethode</Label>
          <Select
            value={preferences.preferredContactMethod}
            onValueChange={(value) => updatePreferences("preferredContactMethod", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">E-Mail</SelectItem>
              <SelectItem value="phone">Telefon</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium">Benachrichtigungen</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emailNotifications"
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => updatePreferences("emailNotifications", checked)}
              />
              <Label htmlFor="emailNotifications">E-Mail-Benachrichtigungen</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="smsNotifications"
                checked={preferences.smsNotifications}
                onCheckedChange={(checked) => updatePreferences("smsNotifications", checked)}
              />
              <Label htmlFor="smsNotifications">SMS-Benachrichtigungen</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="marketingEmails"
                checked={preferences.marketingEmails}
                onCheckedChange={(checked) => updatePreferences("marketingEmails", checked)}
              />
              <Label htmlFor="marketingEmails">Marketing-E-Mails erhalten</Label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="language">Sprache</Label>
            <Select value={preferences.language} onValueChange={(value) => updatePreferences("language", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Zeitzone</Label>
            <Select value={preferences.timezone} onValueChange={(value) => updatePreferences("timezone", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Europe/Berlin">Berlin (CET)</SelectItem>
                <SelectItem value="Europe/Vienna">Wien (CET)</SelectItem>
                <SelectItem value="Europe/Zurich">Zürich (CET)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

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
      </CardContent>
    </Card>
  )
}
