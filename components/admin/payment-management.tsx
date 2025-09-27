"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreditCard, Search, Filter, Eye, AlertCircle, CheckCircle, Clock } from "lucide-react"

interface Payment {
  id: string
  amount: number
  status: string
  payment_method: string
  created_at: string
  job_id: string
  customer_id: string
  handwerker_id: string
  jobs: {
    title: string
  }
  customer_profile: {
    first_name: string
    last_name: string
    company_name: string | null
  }
  handwerker_profile: {
    first_name: string
    last_name: string
    company_name: string | null
  }
}

interface PaymentManagementProps {
  currentUser: any
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
}

const statusLabels = {
  pending: "Ausstehend",
  completed: "Abgeschlossen",
  failed: "Fehlgeschlagen",
  refunded: "Erstattet",
}

export function PaymentManagement({ currentUser }: PaymentManagementProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchPayments()
  }, [statusFilter])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from("payments")
        .select(`
          *,
          jobs:job_id (title),
          customer_profile:customer_id (first_name, last_name, company_name),
          handwerker_profile:handwerker_id (first_name, last_name, company_name)
        `)
        .order("created_at", { ascending: false })

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setPayments(data || [])
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = payments.filter(
    (payment) =>
      payment.jobs?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer_profile?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer_profile?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.handwerker_profile?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.handwerker_profile?.last_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "failed":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Zahlungsverwaltung</h2>
          <p className="text-muted-foreground">Verwalten Sie alle Zahlungen und Transaktionen</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Suchen Sie nach Zahlungen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="pending">Ausstehend</SelectItem>
            <SelectItem value="completed">Abgeschlossen</SelectItem>
            <SelectItem value="failed">Fehlgeschlagen</SelectItem>
            <SelectItem value="refunded">Erstattet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Zahlungen ({filteredPayments.length})</CardTitle>
          <CardDescription>Übersicht aller Zahlungstransaktionen</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Auftrag</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead>Handwerker</TableHead>
                <TableHead>Betrag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.jobs?.title}</TableCell>
                  <TableCell>
                    {payment.customer_profile?.company_name ||
                      `${payment.customer_profile?.first_name} ${payment.customer_profile?.last_name}`}
                  </TableCell>
                  <TableCell>
                    {payment.handwerker_profile?.company_name ||
                      `${payment.handwerker_profile?.first_name} ${payment.handwerker_profile?.last_name}`}
                  </TableCell>
                  <TableCell className="font-mono">{formatAmount(payment.amount)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[payment.status as keyof typeof statusColors]}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(payment.status)}
                        {statusLabels[payment.status as keyof typeof statusLabels]}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(payment.created_at)}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedPayment(payment)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Zahlungsdetails</DialogTitle>
                          <DialogDescription>Detaillierte Informationen zur Zahlung</DialogDescription>
                        </DialogHeader>
                        {selectedPayment && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Zahlungs-ID</label>
                                <p className="text-sm text-muted-foreground font-mono">{selectedPayment.id}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Betrag</label>
                                <p className="text-sm font-semibold">{formatAmount(selectedPayment.amount)}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Status</label>
                                <Badge className={statusColors[selectedPayment.status as keyof typeof statusColors]}>
                                  {statusLabels[selectedPayment.status as keyof typeof statusLabels]}
                                </Badge>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Zahlungsmethode</label>
                                <p className="text-sm text-muted-foreground">{selectedPayment.payment_method}</p>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Auftrag</label>
                              <p className="text-sm text-muted-foreground">{selectedPayment.jobs?.title}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Erstellt am</label>
                              <p className="text-sm text-muted-foreground">{formatDate(selectedPayment.created_at)}</p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredPayments.length === 0 && (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Keine Zahlungen gefunden.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
