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
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ArrowLeft,
  Building2,
  Tag,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface Customer {
  id: string
  name: string
  person: string
  email: string
  phone: string
  address: string
  source: string
  tags: string[]
  created_by: string
  created_at: string
  updated_at: string
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error("Error fetching customers:", error)
      toast({
        title: "Fehler",
        description: "Kunden konnten nicht geladen werden.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCustomer = async (customerId: string, updates: Partial<Customer>) => {
    try {
      const { error } = await supabase.from("customers").update(updates).eq("id", customerId)

      if (error) throw error

      await fetchCustomers()
      setIsEditDialogOpen(false)
      toast({
        title: "Erfolg",
        description: "Kunde wurde aktualisiert.",
      })
    } catch (error) {
      console.error("Error updating customer:", error)
      toast({
        title: "Fehler",
        description: "Kunde konnte nicht aktualisiert werden.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm("Sind Sie sicher, dass Sie diesen Kunden löschen möchten?")) {
      return
    }

    try {
      const { error } = await supabase.from("customers").delete().eq("id", customerId)

      if (error) throw error

      await fetchCustomers()
      toast({
        title: "Erfolg",
        description: "Kunde wurde gelöscht.",
      })
    } catch (error) {
      console.error("Error deleting customer:", error)
      toast({
        title: "Fehler",
        description: "Kunde konnte nicht gelöscht werden.",
        variant: "destructive",
      })
    }
  }

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSource = sourceFilter === "all" || customer.source === sourceFilter
    return matchesSearch && matchesSource
  })

  const getSourceBadgeVariant = (source: string) => {
    switch (source) {
      case "website":
        return "default"
      case "referral":
        return "secondary"
      case "phone":
        return "outline"
      case "email":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "website":
        return "Website"
      case "referral":
        return "Empfehlung"
      case "phone":
        return "Telefon"
      case "email":
        return "E-Mail"
      default:
        return source
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
              <Button variant="ghost" size="sm" onClick={() => router.push("/admin/projects")} className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zu Projekten
              </Button>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Kundenverwaltung</h1>
                <p className="text-muted-foreground">{filteredCustomers.length} Kunden gefunden</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => router.push("/admin/projects")}>
                <Building2 className="h-4 w-4 mr-2" />
                Projekte verwalten
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Neuer Kunde
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Neuen Kunden erstellen</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-foreground">
                          Firmenname
                        </Label>
                        <Input id="name" className="bg-background border-border" />
                      </div>
                      <div>
                        <Label htmlFor="person" className="text-foreground">
                          Ansprechpartner
                        </Label>
                        <Input id="person" className="bg-background border-border" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email" className="text-foreground">
                          E-Mail
                        </Label>
                        <Input id="email" type="email" className="bg-background border-border" />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-foreground">
                          Telefon
                        </Label>
                        <Input id="phone" className="bg-background border-border" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address" className="text-foreground">
                        Adresse
                      </Label>
                      <Textarea id="address" className="bg-background border-border" />
                    </div>
                    <div>
                      <Label htmlFor="source" className="text-foreground">
                        Quelle
                      </Label>
                      <Select>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Quelle auswählen" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="referral">Empfehlung</SelectItem>
                          <SelectItem value="phone">Telefon</SelectItem>
                          <SelectItem value="email">E-Mail</SelectItem>
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
                    placeholder="Nach Name, Person oder E-Mail suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background border-border"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-40 bg-background border-border">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">Alle Quellen</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Empfehlung</SelectItem>
                    <SelectItem value="phone">Telefon</SelectItem>
                    <SelectItem value="email">E-Mail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Kunden</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Kunde</TableHead>
                  <TableHead className="text-muted-foreground">Kontakt</TableHead>
                  <TableHead className="text-muted-foreground">Quelle</TableHead>
                  <TableHead className="text-muted-foreground">Tags</TableHead>
                  <TableHead className="text-muted-foreground">Erstellt</TableHead>
                  <TableHead className="text-muted-foreground">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.person}</div>
                          {customer.address && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {customer.address}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {customer.email && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSourceBadgeVariant(customer.source)}>{getSourceLabel(customer.source)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {customer.tags && customer.tags.length > 0 ? (
                          customer.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Tag className="h-2 w-2 mr-1" />
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">Keine Tags</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(customer.created_at).toLocaleDateString("de-DE")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog
                          open={isEditDialogOpen && selectedCustomer?.id === customer.id}
                          onOpenChange={(open) => {
                            setIsEditDialogOpen(open)
                            if (open) setSelectedCustomer(customer)
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-card border-border max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-foreground">Kunde bearbeiten</DialogTitle>
                            </DialogHeader>
                            {selectedCustomer && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="edit-name" className="text-foreground">
                                      Firmenname
                                    </Label>
                                    <Input
                                      id="edit-name"
                                      defaultValue={selectedCustomer.name}
                                      className="bg-background border-border"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-person" className="text-foreground">
                                      Ansprechpartner
                                    </Label>
                                    <Input
                                      id="edit-person"
                                      defaultValue={selectedCustomer.person}
                                      className="bg-background border-border"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="edit-email" className="text-foreground">
                                      E-Mail
                                    </Label>
                                    <Input
                                      id="edit-email"
                                      defaultValue={selectedCustomer.email}
                                      className="bg-background border-border"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-phone" className="text-foreground">
                                      Telefon
                                    </Label>
                                    <Input
                                      id="edit-phone"
                                      defaultValue={selectedCustomer.phone}
                                      className="bg-background border-border"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="edit-address" className="text-foreground">
                                    Adresse
                                  </Label>
                                  <Textarea
                                    id="edit-address"
                                    defaultValue={selectedCustomer.address}
                                    className="bg-background border-border"
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    Abbrechen
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      handleUpdateCustomer(selectedCustomer.id, { name: selectedCustomer.name })
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
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
