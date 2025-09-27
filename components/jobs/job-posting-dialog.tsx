"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from "next/navigation"

interface JobPostingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const tradeCategories = [
  { value: "elektriker", label: "Elektriker" },
  { value: "klempner", label: "Klempner/Sanitär" },
  { value: "zimmermann", label: "Zimmermann" },
  { value: "maler", label: "Maler/Lackierer" },
  { value: "fliesenleger", label: "Fliesenleger" },
  { value: "heizung", label: "Heizung/Klima" },
  { value: "dachdecker", label: "Dachdecker" },
  { value: "gartenbau", label: "Garten-/Landschaftsbau" },
  { value: "allgemein", label: "Allgemeine Handwerksarbeiten" },
]

export function JobPostingDialog({ open, onOpenChange }: JobPostingDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location_address: "",
    location_city: "",
    location_postal_code: "",
    budget_min: "",
    budget_max: "",
    urgency: "normal",
    preferred_start_date: "",
    estimated_duration_days: "",
    requirements: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Nicht angemeldet")

      const jobData = {
        customer_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location_address: formData.location_address,
        location_city: formData.location_city,
        location_postal_code: formData.location_postal_code,
        budget_min: formData.budget_min ? Number.parseFloat(formData.budget_min) : null,
        budget_max: formData.budget_max ? Number.parseFloat(formData.budget_max) : null,
        urgency: formData.urgency,
        preferred_start_date: formData.preferred_start_date || null,
        estimated_duration_days: formData.estimated_duration_days
          ? Number.parseInt(formData.estimated_duration_days)
          : null,
        requirements: formData.requirements || null,
        status: "open",
      }

      const { error } = await supabase.from("jobs").insert([jobData])

      if (error) throw error

      onOpenChange(false)
      router.refresh()

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        location_address: "",
        location_city: "",
        location_postal_code: "",
        budget_min: "",
        budget_max: "",
        urgency: "normal",
        preferred_start_date: "",
        estimated_duration_days: "",
        requirements: "",
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ein Fehler ist aufgetreten")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neuen Auftrag posten</DialogTitle>
          <DialogDescription>
            Beschreiben Sie Ihr Projekt und erhalten Sie Angebote von qualifizierten Handwerkern.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titel des Auftrags *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="z.B. Badezimmer renovieren"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Kategorie *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie eine Kategorie" />
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

            <div>
              <Label htmlFor="description">Beschreibung *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Beschreiben Sie detailliert, was gemacht werden soll..."
                rows={4}
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Standort</h3>
            <div>
              <Label htmlFor="location_address">Adresse *</Label>
              <Input
                id="location_address"
                value={formData.location_address}
                onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                placeholder="Straße und Hausnummer"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location_postal_code">PLZ *</Label>
                <Input
                  id="location_postal_code"
                  value={formData.location_postal_code}
                  onChange={(e) => setFormData({ ...formData, location_postal_code: e.target.value })}
                  placeholder="12345"
                  required
                />
              </div>
              <div>
                <Label htmlFor="location_city">Stadt *</Label>
                <Input
                  id="location_city"
                  value={formData.location_city}
                  onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                  placeholder="Berlin"
                  required
                />
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Budget</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget_min">Mindestbudget (€)</Label>
                <Input
                  id="budget_min"
                  type="number"
                  value={formData.budget_min}
                  onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                  placeholder="1000"
                />
              </div>
              <div>
                <Label htmlFor="budget_max">Maximalbudget (€)</Label>
                <Input
                  id="budget_max"
                  type="number"
                  value={formData.budget_max}
                  onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                  placeholder="5000"
                />
              </div>
            </div>
          </div>

          {/* Timeline and Urgency */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Zeitplan</h3>
            <div>
              <Label>Dringlichkeit</Label>
              <RadioGroup
                value={formData.urgency}
                onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                className="flex gap-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low">Niedrig</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="normal" />
                  <Label htmlFor="normal">Normal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high">Hoch</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="emergency" id="emergency" />
                  <Label htmlFor="emergency">Notfall</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferred_start_date">Gewünschter Starttermin</Label>
                <Input
                  id="preferred_start_date"
                  type="date"
                  value={formData.preferred_start_date}
                  onChange={(e) => setFormData({ ...formData, preferred_start_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="estimated_duration_days">Geschätzte Dauer (Tage)</Label>
                <Input
                  id="estimated_duration_days"
                  type="number"
                  value={formData.estimated_duration_days}
                  onChange={(e) => setFormData({ ...formData, estimated_duration_days: e.target.value })}
                  placeholder="5"
                />
              </div>
            </div>
          </div>

          {/* Additional Requirements */}
          <div>
            <Label htmlFor="requirements">Besondere Anforderungen</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="Spezielle Materialien, Arbeitszeiten, etc..."
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Wird gepostet..." : "Auftrag posten"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
