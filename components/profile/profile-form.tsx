"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Briefcase, Star, Mail, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface ProfileFormProps {
  user: any
  profile: any
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const isHandwerker = profile?.user_type === "handwerker"

  // Form state
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    company_name: profile?.company_name || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
    city: profile?.city || "",
    postal_code: profile?.postal_code || "",
    website: profile?.website || "",
    description: profile?.description || "",
    // Handwerker specific
    trade_category: profile?.handwerker_profiles?.[0]?.trade_category || "",
    experience_years: profile?.handwerker_profiles?.[0]?.experience_years || "",
    hourly_rate_min: profile?.handwerker_profiles?.[0]?.hourly_rate_min || "",
    hourly_rate_max: profile?.handwerker_profiles?.[0]?.hourly_rate_max || "",
    service_radius_km: profile?.handwerker_profiles?.[0]?.service_radius_km || 50,
    license_number: profile?.handwerker_profiles?.[0]?.license_number || "",
    available_for_emergency: profile?.handwerker_profiles?.[0]?.available_for_emergency || false,
    // Kunde specific
    preferred_contact_method: profile?.kunde_profiles?.[0]?.preferred_contact_method || "email",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      // Update main profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          company_name: formData.company_name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postal_code,
          website: formData.website,
          description: formData.description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (profileError) throw profileError

      // Update type-specific profile
      if (isHandwerker) {
        const { error: handwerkerError } = await supabase.from("handwerker_profiles").upsert({
          id: user.id,
          trade_category: formData.trade_category,
          experience_years: Number.parseInt(formData.experience_years) || null,
          hourly_rate_min: Number.parseFloat(formData.hourly_rate_min) || null,
          hourly_rate_max: Number.parseFloat(formData.hourly_rate_max) || null,
          service_radius_km: Number.parseInt(formData.service_radius_km) || 50,
          license_number: formData.license_number,
          available_for_emergency: formData.available_for_emergency,
          updated_at: new Date().toISOString(),
        })

        if (handwerkerError) throw handwerkerError
      } else {
        const { error: kundeError } = await supabase.from("kunde_profiles").upsert({
          id: user.id,
          preferred_contact_method: formData.preferred_contact_method,
          updated_at: new Date().toISOString(),
        })

        if (kundeError) throw kundeError
      }

      setMessage({ type: "success", text: "Profil erfolgreich aktualisiert!" })
      router.refresh()
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ type: "error", text: "Fehler beim Aktualisieren des Profils." })
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const displayName =
    formData.first_name && formData.last_name
      ? `${formData.first_name} ${formData.last_name}`
      : user.email?.split("@")[0] || "Benutzer"

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.profile_image_url || "/placeholder.svg"} />
              <AvatarFallback className="text-lg">
                {displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{displayName}</h2>
                <Badge variant={isHandwerker ? "default" : "secondary"}>{isHandwerker ? "Handwerker" : "Kunde"}</Badge>
                {profile?.is_verified && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verifiziert
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-2">{user.email}</p>
              {isHandwerker && profile?.handwerker_profiles?.[0] && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {formData.trade_category}
                  </div>
                  {profile.handwerker_profiles[0].rating_average > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {profile.handwerker_profiles[0].rating_average.toFixed(1)}(
                      {profile.handwerker_profiles[0].rating_count} Bewertungen)
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          {message.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Grundinformationen
            </CardTitle>
            <CardDescription>Ihre persönlichen Daten und Kontaktinformationen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Vorname *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => updateFormData("first_name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nachname *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => updateFormData("last_name", e.target.value)}
                  required
                />
              </div>
            </div>

            {isHandwerker && (
              <div className="space-y-2">
                <Label htmlFor="company_name">Firmenname</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => updateFormData("company_name", e.target.value)}
                  placeholder="Ihre Firma (optional)"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  placeholder="+49 123 456789"
                />
              </div>
              {isHandwerker && (
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateFormData("website", e.target.value)}
                    placeholder="https://ihre-website.de"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
                placeholder="Straße und Hausnummer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postal_code">PLZ</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => updateFormData("postal_code", e.target.value)}
                  placeholder="12345"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Stadt</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateFormData("city", e.target.value)}
                  placeholder="Berlin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder={
                  isHandwerker
                    ? "Beschreiben Sie Ihre Erfahrung und Spezialisierung..."
                    : "Erzählen Sie etwas über sich..."
                }
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Handwerker-specific fields */}
        {isHandwerker && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Berufliche Informationen
              </CardTitle>
              <CardDescription>Informationen zu Ihrem Handwerk und Ihren Dienstleistungen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trade_category">Gewerk *</Label>
                  <Select
                    value={formData.trade_category}
                    onValueChange={(value) => updateFormData("trade_category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wählen Sie Ihr Gewerk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electrician">Elektriker</SelectItem>
                      <SelectItem value="plumber">Klempner</SelectItem>
                      <SelectItem value="carpenter">Zimmermann</SelectItem>
                      <SelectItem value="painter">Maler</SelectItem>
                      <SelectItem value="roofer">Dachdecker</SelectItem>
                      <SelectItem value="heating">Heizung & Sanitär</SelectItem>
                      <SelectItem value="flooring">Bodenleger</SelectItem>
                      <SelectItem value="general">Allgemein</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience_years">Berufserfahrung (Jahre)</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experience_years}
                    onChange={(e) => updateFormData("experience_years", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourly_rate_min">Stundensatz von (€)</Label>
                  <Input
                    id="hourly_rate_min"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.hourly_rate_min}
                    onChange={(e) => updateFormData("hourly_rate_min", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourly_rate_max">Stundensatz bis (€)</Label>
                  <Input
                    id="hourly_rate_max"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.hourly_rate_max}
                    onChange={(e) => updateFormData("hourly_rate_max", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service_radius_km">Arbeitsradius (km)</Label>
                  <Input
                    id="service_radius_km"
                    type="number"
                    min="1"
                    max="500"
                    value={formData.service_radius_km}
                    onChange={(e) => updateFormData("service_radius_km", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_number">Lizenznummer</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) => updateFormData("license_number", e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="available_for_emergency"
                  checked={formData.available_for_emergency}
                  onChange={(e) => updateFormData("available_for_emergency", e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="available_for_emergency">Verfügbar für Notfälle</Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Kunde-specific fields */}
        {!isHandwerker && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Kommunikationseinstellungen
              </CardTitle>
              <CardDescription>Wie möchten Sie von Handwerkern kontaktiert werden?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="preferred_contact_method">Bevorzugte Kontaktmethode</Label>
                <Select
                  value={formData.preferred_contact_method}
                  onValueChange={(value) => updateFormData("preferred_contact_method", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">E-Mail</SelectItem>
                    <SelectItem value="phone">Telefon</SelectItem>
                    <SelectItem value="both">Beides</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Speichern..." : "Profil speichern"}
          </Button>
        </div>
      </form>
    </div>
  )
}
