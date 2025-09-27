"use client"

import type React from "react"
import { StartConversationButton } from "@/components/messages/start-conversation-button"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Euro, Clock } from "lucide-react"

interface Job {
  id: string
  title: string
  description: string
  category: string
  location_city: string
  location_postal_code: string
  budget_min: number | null
  budget_max: number | null
  urgency: string
  preferred_start_date: string | null
  estimated_duration_days: number | null
  requirements: string | null
  customer_id: string
  profiles: {
    first_name: string
    last_name: string
    company_name: string | null
    id: string
  }
}

interface JobApplicationDialogProps {
  job: Job
  open: boolean
  onOpenChange: (open: boolean) => void
}

const urgencyColors = {
  low: "bg-blue-100 text-blue-800",
  normal: "bg-gray-100 text-gray-800",
  high: "bg-orange-100 text-orange-800",
  emergency: "bg-red-100 text-red-800",
}

const urgencyLabels = {
  low: "Niedrig",
  normal: "Normal",
  high: "Hoch",
  emergency: "Notfall",
}

export function JobApplicationDialog({ job, open, onOpenChange }: JobApplicationDialogProps) {
  const [formData, setFormData] = useState({
    message: "",
    proposed_price: "",
    estimated_start_date: "",
    estimated_duration_days: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      setCurrentUserId(user.id)
    }
  }

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return "Budget nach Vereinbarung"
    if (min && max) return `€${min.toLocaleString()} - €${max.toLocaleString()}`
    if (min) return `ab €${min.toLocaleString()}`
    if (max) return `bis €${max.toLocaleString()}`
    return "Budget nach Vereinbarung"
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Flexibel"
    return new Date(dateString).toLocaleDateString("de-DE")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Nicht angemeldet")

      const applicationData = {
        job_id: job.id,
        handwerker_id: user.id,
        message: formData.message,
        proposed_price: formData.proposed_price ? Number.parseFloat(formData.proposed_price) : null,
        estimated_start_date: formData.estimated_start_date || null,
        estimated_duration_days: formData.estimated_duration_days
          ? Number.parseInt(formData.estimated_duration_days)
          : null,
        status: "pending",
      }

      const { error } = await supabase.from("job_applications").insert([applicationData])

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        setSuccess(false)
        setFormData({
          message: "",
          proposed_price: "",
          estimated_start_date: "",
          estimated_duration_days: "",
        })
      }, 3000)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ein Fehler ist aufgetreten")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Bewerbung gesendet!</h3>
            <p className="text-sm text-gray-500 mb-4">
              Ihre Bewerbung wurde erfolgreich an den Kunden gesendet. Sie können jetzt eine Nachricht senden.
            </p>
            <StartConversationButton
              jobId={job.id}
              customerId={job.customer_id}
              handwerkerId={currentUserId || undefined}
              variant="outline"
              className="w-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Auf Auftrag bewerben</DialogTitle>
          <DialogDescription>Senden Sie Ihr Angebot für diesen Auftrag.</DialogDescription>
        </DialogHeader>

        {/* Job Details */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg">{job.title}</h3>
            <Badge className={urgencyColors[job.urgency as keyof typeof urgencyColors]}>
              {urgencyLabels[job.urgency as keyof typeof urgencyLabels]}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.location_city}, {job.location_postal_code}
            </div>
            <div className="flex items-center gap-1">
              <Euro className="h-4 w-4" />
              {formatBudget(job.budget_min, job.budget_max)}
            </div>
          </div>

          <p className="text-sm">{job.description}</p>

          {job.requirements && (
            <div>
              <h4 className="font-medium text-sm mb-1">Besondere Anforderungen:</h4>
              <p className="text-sm text-muted-foreground">{job.requirements}</p>
            </div>
          )}

          <div className="flex gap-4 text-sm">
            {job.preferred_start_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Start: {formatDate(job.preferred_start_date)}</span>
              </div>
            )}
            {job.estimated_duration_days && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{job.estimated_duration_days} Tage geschätzt</span>
              </div>
            )}
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="message">Ihre Nachricht *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Beschreiben Sie Ihre Erfahrung und Ihren Ansatz für dieses Projekt..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="proposed_price">Ihr Angebotspreis (€)</Label>
            <Input
              id="proposed_price"
              type="number"
              value={formData.proposed_price}
              onChange={(e) => setFormData({ ...formData, proposed_price: e.target.value })}
              placeholder="2500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimated_start_date">Ihr Starttermin</Label>
              <Input
                id="estimated_start_date"
                type="date"
                value={formData.estimated_start_date}
                onChange={(e) => setFormData({ ...formData, estimated_start_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="estimated_duration_days">Ihre Zeitschätzung (Tage)</Label>
              <Input
                id="estimated_duration_days"
                type="number"
                value={formData.estimated_duration_days}
                onChange={(e) => setFormData({ ...formData, estimated_duration_days: e.target.value })}
                placeholder="7"
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Wird gesendet..." : "Bewerbung senden"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
