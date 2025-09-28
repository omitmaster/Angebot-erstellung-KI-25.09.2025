"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Building2,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  ArrowLeft,
  Users,
  ExternalLink,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface Project {
  id: string
  customer_id: string
  title: string
  site_address: string
  status: string
  created_at: string
  updated_at: string
  clickup_id?: string
  hubspot_id?: string
  folder_url?: string
}

interface Customer {
  id: string
  name: string
  person: string
  email: string
  phone: string
  address: string
  source: string
  tags: string[]
  created_at: string
}

export default function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
    fetchProjects()
    fetchCustomers()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error("Error fetching projects:", error)
      toast({
        title: "Fehler",
        description: "Projekte konnten nicht geladen werden.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase.from("customers").select("*")

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error("Error fetching customers:", error)
    }
  }

  const handleUpdateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const { error } = await supabase.from("projects").update(updates).eq("id", projectId)

      if (error) throw error

      await fetchProjects()
      setIsEditDialogOpen(false)
      toast({
        title: "Erfolg",
        description: "Projekt wurde aktualisiert.",
      })
    } catch (error) {
      console.error("Error updating project:", error)
      toast({
        title: "Fehler",
        description: "Projekt konnte nicht aktualisiert werden.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Sind Sie sicher, dass Sie dieses Projekt löschen möchten?")) {
      return
    }

    try {
      const { error } = await supabase.from("projects").delete().eq("id", projectId)

      if (error) throw error

      await fetchProjects()
      toast({
        title: "Erfolg",
        description: "Projekt wurde gelöscht.",
      })
    } catch (error) {
      console.error("Error deleting project:", error)
      toast({
        title: "Fehler",
        description: "Projekt konnte nicht gelöscht werden.",
        variant: "destructive",
      })
    }
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.site_address?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getCustomer = (customerId: string) => {
    return customers.find((customer) => customer.id === customerId)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "completed":
        return "secondary"
      case "cancelled":
        return "destructive"
      case "pending":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Aktiv"
      case "completed":
        return "Abgeschlossen"
      case "cancelled":
        return "Abgebrochen"
      case "pending":
        return "Ausstehend"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-4">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 py-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-card rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push("/admin")} className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Projektverwaltung</h1>
                <p className="text-muted-foreground">{filteredProjects.length} Projekte gefunden</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => router.push("/admin/customers")}>
                <Users className="h-4 w-4 mr-2" />
                Kunden verwalten
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Neues Projekt
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Neues Projekt erstellen</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-foreground">
                        Projekttitel
                      </Label>
                      <Input id="title" className="bg-background border-border" />
                    </div>
                    <div>
                      <Label htmlFor="customer" className="text-foreground">
                        Kunde
                      </Label>
                      <Select>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Kunde auswählen" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name} - {customer.person}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="address" className="text-foreground">
                        Projektadresse
                      </Label>
                      <Textarea id="address" className="bg-background border-border" />
                    </div>
                    <div>
                      <Label htmlFor="status" className="text-foreground">
                        Status
                      </Label>
                      <Select>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Status auswählen" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="pending">Ausstehend</SelectItem>
                          <SelectItem value="active">Aktiv</SelectItem>
                          <SelectItem value="completed">Abgeschlossen</SelectItem>
                          <SelectItem value="cancelled">Abgebrochen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Abbrechen
                      </Button>
                      <Button>Erstellen</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Filters */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nach Projekttitel oder Adresse suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background border-border"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-background border-border">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">Alle Status</SelectItem>
                    <SelectItem value="pending">Ausstehend</SelectItem>
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="completed">Abgeschlossen</SelectItem>
                    <SelectItem value="cancelled">Abgebrochen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Projekte</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Projekt</TableHead>
                  <TableHead className="text-muted-foreground">Kunde</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Erstellt</TableHead>
                  <TableHead className="text-muted-foreground">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => {
                  const customer = getCustomer(project.customer_id)
                  return (
                    <TableRow key={project.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{project.title}</div>
                            {project.site_address && (
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {project.site_address}
                              </div>
                            )}
                            {project.folder_url && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <ExternalLink className="h-3 w-3" />
                                <a
                                  href={project.folder_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-primary"
                                >
                                  Projektordner
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer ? (
                          <div>
                            <div className="font-medium text-foreground">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">{customer.person}</div>
                            {customer.email && <div className="text-xs text-muted-foreground">{customer.email}</div>}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Kunde nicht gefunden</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(project.status)}>{getStatusLabel(project.status)}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(project.created_at).toLocaleDateString("de-DE")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog
                            open={isEditDialogOpen && selectedProject?.id === project.id}
                            onOpenChange={(open) => {
                              setIsEditDialogOpen(open)
                              if (open) setSelectedProject(project)
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-card border-border max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-foreground">Projekt bearbeiten</DialogTitle>
                              </DialogHeader>
                              {selectedProject && (
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="edit-title" className="text-foreground">
                                      Projekttitel
                                    </Label>
                                    <Input
                                      id="edit-title"
                                      defaultValue={selectedProject.title}
                                      className="bg-background border-border"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-address" className="text-foreground">
                                      Projektadresse
                                    </Label>
                                    <Textarea
                                      id="edit-address"
                                      defaultValue={selectedProject.site_address}
                                      className="bg-background border-border"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-status" className="text-foreground">
                                      Status
                                    </Label>
                                    <Select defaultValue={selectedProject.status}>
                                      <SelectTrigger className="bg-background border-border">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-card border-border">
                                        <SelectItem value="pending">Ausstehend</SelectItem>
                                        <SelectItem value="active">Aktiv</SelectItem>
                                        <SelectItem value="completed">Abgeschlossen</SelectItem>
                                        <SelectItem value="cancelled">Abgebrochen</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                      Abbrechen
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleUpdateProject(selectedProject.id, { title: selectedProject.title })
                                      }
                                    >
                                      Speichern
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
