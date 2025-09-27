"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Euro, Clock, User } from "lucide-react"

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
  created_at: string
  profiles: {
    first_name: string
    last_name: string
    company_name: string | null
  }
}

interface JobDetailsDialogProps {
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

export function JobDetailsDialog({ job, open, onOpenChange }: JobDetailsDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-start justify-between">
            <span className="flex-1">{job.title}</span>
            <Badge className={urgencyColors[job.urgency as keyof typeof urgencyColors]}>
              {urgencyLabels[job.urgency as keyof typeof urgencyLabels]}
            </Badge>
          </DialogTitle>
          <DialogDescription>Auftrag vom {new Date(job.created_at).toLocaleDateString("de-DE")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>
                {job.location_city}, {job.location_postal_code}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-muted-foreground" />
              <span>{formatBudget(job.budget_min, job.budget_max)}</span>
            </div>
            {job.preferred_start_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Start: {formatDate(job.preferred_start_date)}</span>
              </div>
            )}
            {job.estimated_duration_days && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{job.estimated_duration_days} Tage geschätzt</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Beschreibung</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.description}</p>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div>
              <h3 className="font-semibold mb-2">Besondere Anforderungen</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.requirements}</p>
            </div>
          )}

          {/* Customer Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Auftraggeber</h3>
            </div>
            <p className="text-sm">
              {job.profiles?.company_name || `${job.profiles?.first_name} ${job.profiles?.last_name}`}
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Schließen</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
