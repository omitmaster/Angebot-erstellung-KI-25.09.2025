"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, AlertTriangle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale"

interface Job {
  id: string
  title: string
  description: string
  category: string
  budget_min: number | null
  budget_max: number | null
  status: string
  created_at: string
  customer: {
    first_name: string
    last_name: string
    company_name: string | null
  }
  assigned_handwerker: {
    first_name: string
    last_name: string
    company_name: string | null
  } | null
  applications_count: number
}

interface JobManagementProps {
  currentUser: any
}

export function JobManagement({ currentUser }: JobManagementProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalJobs, setTotalJobs] = useState(0)

  const supabase = createClient()
  const jobsPerPage = 10

  useEffect(() => {
    fetchJobs()
  }, [currentPage, searchTerm, filterStatus])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from("jobs")
        .select(
          `
          id,
          title,
          description,
          category,
          budget_min,
          budget_max,
          status,
          created_at,
          customer:customer_id (
            first_name,
            last_name,
            company_name
          ),
          assigned_handwerker:assigned_handwerker_id (
            first_name,
            last_name,
            company_name
          ),
          job_applications (count)
        `,
          { count: "exact" },
        )
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage - 1)

      // Apply filters
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
      }

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus)
      }

      const { data, error, count } = await query

      if (error) throw error

      setJobs(
        (data || []).map((job) => ({
          ...job,
          applications_count: job.job_applications?.[0]?.count || 0,
        })),
      )
      setTotalJobs(count || 0)
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("jobs").update({ status: newStatus }).eq("id", jobId)

      if (error) throw error

      // Log admin activity
      await supabase.rpc("log_admin_activity", {
        p_admin_id: currentUser.id,
        p_action: "update_job_status",
        p_resource_type: "job",
        p_resource_id: jobId,
        p_details: { new_status: newStatus },
      })

      fetchJobs()
    } catch (error) {
      console.error("Error updating job status:", error)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "open":
        return "default"
      case "in_progress":
        return "secondary"
      case "completed":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      open: "Offen",
      in_progress: "In Bearbeitung",
      completed: "Abgeschlossen",
      cancelled: "Storniert",
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Auftragsverwaltung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-3">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-muted rounded w-16"></div>
                  <div className="h-6 bg-muted rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auftragsverwaltung</CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Aufträge suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="open">Offen</SelectItem>
              <SelectItem value="in_progress">In Bearbeitung</SelectItem>
              <SelectItem value="completed">Abgeschlossen</SelectItem>
              <SelectItem value="cancelled">Storniert</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{job.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{job.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      Kunde: {job.customer.company_name || `${job.customer.first_name} ${job.customer.last_name}`}
                    </span>
                    {job.assigned_handwerker && (
                      <span>
                        • Handwerker:{" "}
                        {job.assigned_handwerker.company_name ||
                          `${job.assigned_handwerker.first_name} ${job.assigned_handwerker.last_name}`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(job.status)}>{getStatusLabel(job.status)}</Badge>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Kategorie: {job.category}</span>
                  {job.budget_min && job.budget_max && (
                    <span>
                      Budget: €{job.budget_min} - €{job.budget_max}
                    </span>
                  )}
                  <span>{job.applications_count} Bewerbungen</span>
                  <span>
                    Erstellt{" "}
                    {formatDistanceToNow(new Date(job.created_at), {
                      addSuffix: true,
                      locale: de,
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {job.status === "open" && (
                    <Button variant="outline" size="sm" onClick={() => handleUpdateJobStatus(job.id, "cancelled")}>
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Stornieren
                    </Button>
                  )}
                  {job.status === "in_progress" && (
                    <Button variant="outline" size="sm" onClick={() => handleUpdateJobStatus(job.id, "completed")}>
                      Abschließen
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Zeige {(currentPage - 1) * jobsPerPage + 1} bis {Math.min(currentPage * jobsPerPage, totalJobs)} von{" "}
            {totalJobs} Aufträgen
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Zurück
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage * jobsPerPage >= totalJobs}
            >
              Weiter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
