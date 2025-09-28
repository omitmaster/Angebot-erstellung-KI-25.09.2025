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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  ArrowLeft,
  Euro,
  Building2,
  Users,
  ExternalLink,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface Offer {
  id: string
  project_id: string
  version: number
  status: string
  total: number
  subtotal_labor: number
  subtotal_material: number
  discount_pct: number
  risk_pct: number
  currency: string
  pdf_url?: string
  excel_url?: string
  gaeb_url?: string
  created_at: string
  sent_at?: string
  viewed_at?: string
  decided_at?: string
  updated_at: string
}

interface Project {
  id: string
  title: string
  customer_id: string
}

interface Customer {
  id: string
  name: string
  person: string
}

interface Contract {
  id: string
  offer_id: string
  status: string
  boldsign_id?: string
  signed_doc_url?: string
  signed_at?: string
  created_at: string
}

export default function OffersManagement() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"offers" | "contracts">("offers")
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [offersData, contractsData, projectsData, customersData] = await Promise.all([
        supabase.from("offers").select("*").order("created_at", { ascending: false }),
        supabase.from("contracts").select("*").order("created_at", { ascending: false }),
        supabase.from("projects").select("id, title, customer_id"),
        supabase.from("customers").select("id, name, person"),
      ])

      if (offersData.error) throw offersData.error
      if (contractsData.error) throw contractsData.error
      if (projectsData.error) throw projectsData.error
      if (customersData.error) throw customersData.error

      setOffers(offersData.data || [])
      setContracts(contractsData.data || [])
      setProjects(projectsData.data || [])
      setCustomers(customersData.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Fehler",
        description: "Daten konnten nicht geladen werden.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateOfferStatus = async (offerId: string, status: string) => {
    try {
      const updates: any = { status }
      if (status === "sent" && !offers.find((o) => o.id === offerId)?.sent_at) {
        updates.sent_at = new Date().toISOString()
      }
      if (status === "accepted" || status === "rejected") {
        updates.decided_at = new Date().toISOString()
      }

      const { error } = await supabase.from("offers").update(updates).eq("id", offerId)

      if (error) throw error

      await fetchData()
      toast({
        title: "Erfolg",
        description: "Angebotsstatus wurde aktualisiert.",
      })
    } catch (error) {
      console.error("Error updating offer status:", error)
      toast({
        title: "Fehler",
        description: "Angebotsstatus konnte nicht aktualisiert werden.",
        variant: "destructive",
      })
    }
  }

  const getProject = (projectId: string) => {
    return projects.find((project) => project.id === projectId)
  }

  const getCustomer = (customerId: string) => {
    return customers.find((customer) => customer.id === customerId)
  }

  const getContract = (offerId: string) => {
    return contracts.find((contract) => contract.offer_id === offerId)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "draft":
        return "outline"
      case "sent":
        return "secondary"
      case "viewed":
        return "default"
      case "accepted":
        return "default"
      case "rejected":
        return "destructive"
      case "expired":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return "Entwurf"
      case "sent":
        return "Gesendet"
      case "viewed":
        return "Angesehen"
      case "accepted":
        return "Angenommen"
      case "rejected":
        return "Abgelehnt"
      case "expired":
        return "Abgelaufen"
      default:
        return status
    }
  }

  const getContractStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "outline"
      case "signed":
        return "default"
      case "completed":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getContractStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Ausstehend"
      case "signed":
        return "Unterzeichnet"
      case "completed":
        return "Abgeschlossen"
      case "cancelled":
        return "Storniert"
      default:
        return status
    }
  }

  const filteredOffers = offers.filter((offer) => {
    const project = getProject(offer.project_id)
    const customer = project ? getCustomer(project.customer_id) : null
    const matchesSearch =
      project?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.person?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || offer.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredContracts = contracts.filter((contract) => {
    const offer = offers.find((o) => o.id === contract.offer_id)
    const project = offer ? getProject(offer.project_id) : null
    const customer = project ? getCustomer(project.customer_id) : null
    const matchesSearch =
      project?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.person?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Angebote & Verträge</h1>
                <p className="text-muted-foreground">
                  {activeTab === "offers"
                    ? `${filteredOffers.length} Angebote gefunden`
                    : `${filteredContracts.length} Verträge gefunden`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={activeTab === "offers" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("offers")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Angebote
                </Button>
                <Button
                  variant={activeTab === "contracts" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("contracts")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Verträge
                </Button>
              </div>
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
                    placeholder="Nach Projekt oder Kunde suchen..."
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
                    {activeTab === "offers" ? (
                      <>
                        <SelectItem value="draft">Entwurf</SelectItem>
                        <SelectItem value="sent">Gesendet</SelectItem>
                        <SelectItem value="viewed">Angesehen</SelectItem>
                        <SelectItem value="accepted">Angenommen</SelectItem>
                        <SelectItem value="rejected">Abgelehnt</SelectItem>
                        <SelectItem value="expired">Abgelaufen</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="pending">Ausstehend</SelectItem>
                        <SelectItem value="signed">Unterzeichnet</SelectItem>
                        <SelectItem value="completed">Abgeschlossen</SelectItem>
                        <SelectItem value="cancelled">Storniert</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {activeTab === "offers" ? (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Angebote</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Projekt</TableHead>
                    <TableHead className="text-muted-foreground">Kunde</TableHead>
                    <TableHead className="text-muted-foreground">Betrag</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Erstellt</TableHead>
                    <TableHead className="text-muted-foreground">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOffers.map((offer) => {
                    const project = getProject(offer.project_id)
                    const customer = project ? getCustomer(project.customer_id) : null
                    const contract = getContract(offer.id)
                    return (
                      <TableRow key={offer.id} className="border-border">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">
                                {project?.title || "Unbekanntes Projekt"}
                              </div>
                              <div className="text-sm text-muted-foreground">Version {offer.version}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer ? (
                            <div>
                              <div className="font-medium text-foreground">{customer.name}</div>
                              <div className="text-sm text-muted-foreground">{customer.person}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Kunde nicht gefunden</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Euro className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium text-foreground">
                              {offer.total?.toLocaleString("de-DE", { minimumFractionDigits: 2 }) || "0,00"}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">{offer.currency || "EUR"}</div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={getStatusBadgeVariant(offer.status)}>{getStatusLabel(offer.status)}</Badge>
                            {contract && (
                              <Badge variant={getContractStatusBadgeVariant(contract.status)} className="text-xs">
                                Vertrag: {getContractStatusLabel(contract.status)}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(offer.created_at).toLocaleDateString("de-DE")}
                          </div>
                          {offer.sent_at && (
                            <div className="text-xs text-muted-foreground">
                              Gesendet: {new Date(offer.sent_at).toLocaleDateString("de-DE")}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog
                              open={isViewDialogOpen && selectedOffer?.id === offer.id}
                              onOpenChange={(open) => {
                                setIsViewDialogOpen(open)
                                if (open) setSelectedOffer(offer)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-card border-border max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="text-foreground">Angebot Details</DialogTitle>
                                </DialogHeader>
                                {selectedOffer && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-foreground">Projekt</Label>
                                        <p className="text-sm text-muted-foreground">
                                          {getProject(selectedOffer.project_id)?.title || "Unbekannt"}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-foreground">Version</Label>
                                        <p className="text-sm text-muted-foreground">{selectedOffer.version}</p>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-foreground">Arbeitskosten</Label>
                                        <p className="text-sm text-muted-foreground">
                                          €{" "}
                                          {selectedOffer.subtotal_labor?.toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                          }) || "0,00"}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-foreground">Materialkosten</Label>
                                        <p className="text-sm text-muted-foreground">
                                          €{" "}
                                          {selectedOffer.subtotal_material?.toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                          }) || "0,00"}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-foreground">Rabatt</Label>
                                        <p className="text-sm text-muted-foreground">
                                          {selectedOffer.discount_pct || 0}%
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-foreground">Risikozuschlag</Label>
                                        <p className="text-sm text-muted-foreground">{selectedOffer.risk_pct || 0}%</p>
                                      </div>
                                    </div>
                                    <div className="border-t border-border pt-4">
                                      <div className="flex justify-between items-center">
                                        <Label className="text-foreground text-lg">Gesamtbetrag</Label>
                                        <p className="text-lg font-bold text-foreground">
                                          €{" "}
                                          {selectedOffer.total?.toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                          }) || "0,00"}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <div className="flex gap-2">
                                        {selectedOffer.pdf_url && (
                                          <Button variant="outline" size="sm" asChild>
                                            <a href={selectedOffer.pdf_url} target="_blank" rel="noopener noreferrer">
                                              <Download className="h-4 w-4 mr-2" />
                                              PDF
                                            </a>
                                          </Button>
                                        )}
                                        {selectedOffer.excel_url && (
                                          <Button variant="outline" size="sm" asChild>
                                            <a href={selectedOffer.excel_url} target="_blank" rel="noopener noreferrer">
                                              <Download className="h-4 w-4 mr-2" />
                                              Excel
                                            </a>
                                          </Button>
                                        )}
                                      </div>
                                      <Select
                                        value={selectedOffer.status}
                                        onValueChange={(status) => handleUpdateOfferStatus(selectedOffer.id, status)}
                                      >
                                        <SelectTrigger className="w-40 bg-background border-border">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                          <SelectItem value="draft">Entwurf</SelectItem>
                                          <SelectItem value="sent">Gesendet</SelectItem>
                                          <SelectItem value="viewed">Angesehen</SelectItem>
                                          <SelectItem value="accepted">Angenommen</SelectItem>
                                          <SelectItem value="rejected">Abgelehnt</SelectItem>
                                          <SelectItem value="expired">Abgelaufen</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            {offer.pdf_url && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={offer.pdf_url} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Verträge</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Projekt</TableHead>
                    <TableHead className="text-muted-foreground">Kunde</TableHead>
                    <TableHead className="text-muted-foreground">Angebotsbetrag</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Erstellt</TableHead>
                    <TableHead className="text-muted-foreground">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract) => {
                    const offer = offers.find((o) => o.id === contract.offer_id)
                    const project = offer ? getProject(offer.project_id) : null
                    const customer = project ? getCustomer(project.customer_id) : null
                    return (
                      <TableRow key={contract.id} className="border-border">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">
                                {project?.title || "Unbekanntes Projekt"}
                              </div>
                              {contract.boldsign_id && (
                                <div className="text-xs text-muted-foreground">ID: {contract.boldsign_id}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer ? (
                            <div>
                              <div className="font-medium text-foreground">{customer.name}</div>
                              <div className="text-sm text-muted-foreground">{customer.person}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Kunde nicht gefunden</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {offer && (
                            <div className="flex items-center gap-1">
                              <Euro className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium text-foreground">
                                {offer.total?.toLocaleString("de-DE", { minimumFractionDigits: 2 }) || "0,00"}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getContractStatusBadgeVariant(contract.status)}>
                            {getContractStatusLabel(contract.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(contract.created_at).toLocaleDateString("de-DE")}
                          </div>
                          {contract.signed_at && (
                            <div className="text-xs text-muted-foreground">
                              Unterzeichnet: {new Date(contract.signed_at).toLocaleDateString("de-DE")}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {contract.signed_doc_url && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={contract.signed_doc_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
