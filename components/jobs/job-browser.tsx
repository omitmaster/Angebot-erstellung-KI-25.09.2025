"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Calendar, Euro, Clock, Search, Filter } from "lucide-react"
import { JobApplicationDialog } from "./job-application-dialog"
import { JobDetailsDialog } from "./job-details-dialog"

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
  created_at: string
  customer_id: string
  profiles: {
    id: string
    first_name: string
    last_name: string
    company_name: string | null
  }
}

interface JobBrowserProps {
  userType: string
}

const tradeCategories = [
  { value: "all", label: "Alle Kategorien" },
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

export function JobBrowser({ userType }: JobBrowserProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showApplicationDialog, setShowApplicationDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchJobs()
  }, [selectedCategory])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from("jobs")
        .select(
          `
          *,
          profiles:customer_id (
            id,
            first_name,
            last_name,
            company_name
          )
        `,
        )
        .eq("status", "open")
        .order("created_at", { ascending: false })

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory)
      }

      const { data, error } = await query

      if (error) throw error
      setJobs(data || [])
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location_city.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  const handleJobClick = (job: Job) => {
    setSelectedJob(job)
    if (userType === "handwerker") {
      setShowApplicationDialog(true)
    } else {
      setShowDetailsDialog(true)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Suchen Sie nach Aufträgen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
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

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <Card
            key={job.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleJobClick(job)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {job.location_city}, {job.location_postal_code}
                  </CardDescription>
                </div>
                <Badge className={urgencyColors[job.urgency as keyof typeof urgencyColors]}>
                  {urgencyLabels[job.urgency as keyof typeof urgencyLabels]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{job.description}</p>

              <div className="space-y-2 text-sm">
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

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-xs text-muted-foreground">
                  {job.profiles?.company_name || `${job.profiles?.first_name} ${job.profiles?.last_name}`}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(job.created_at).toLocaleDateString("de-DE")}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Keine Aufträge gefunden.</p>
          <p className="text-sm text-muted-foreground mt-1">Versuchen Sie andere Suchkriterien.</p>
        </div>
      )}

      {/* Dialogs */}
      {selectedJob && userType === "handwerker" && (
        <JobApplicationDialog job={selectedJob} open={showApplicationDialog} onOpenChange={setShowApplicationDialog} />
      )}

      {selectedJob && userType === "kunde" && (
        <JobDetailsDialog job={selectedJob} open={showDetailsDialog} onOpenChange={setShowDetailsDialog} />
      )}
    </div>
  )
}
