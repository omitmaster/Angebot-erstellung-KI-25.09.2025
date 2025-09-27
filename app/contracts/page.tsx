"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  FileText,
  Download,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Edit,
  Ligature as Signature,
  Euro,
} from "lucide-react"

interface Contract {
  id: string
  contractNumber: string
  offerId: string
  offerNumber: string
  customerName: string
  customerEmail: string
  projectTitle: string
  contractAmount: number
  status: "draft" | "sent" | "signed" | "active" | "completed" | "cancelled"
  createdDate: string
  signedDate?: string
  startDate?: string
  completionDate?: string
  paymentTerms: {
    deposit: number
    milestone1: number
    milestone2: number
    final: number
  }
  contractTerms: string
  notes: string
}

const mockContracts: Contract[] = [
  {
    id: "1",
    contractNumber: "VTG-2024-001",
    offerId: "2024-001",
    offerNumber: "ANG-2024-001",
    customerName: "Müller Bau GmbH",
    customerEmail: "info@mueller-bau.de",
    projectTitle: "WDVS Sanierung Einfamilienhaus",
    contractAmount: 23880.13,
    status: "signed",
    createdDate: "2024-01-20",
    signedDate: "2024-01-22",
    startDate: "2024-02-01",
    completionDate: "2024-03-15",
    paymentTerms: {
      deposit: 30,
      milestone1: 40,
      milestone2: 0,
      final: 30,
    },
    contractTerms: "Standardvertragsbedingungen für WDVS-Arbeiten. Gewährleistung 5 Jahre.",
    notes: "Kunde möchte Arbeiten nach Karneval beginnen",
  },
  {
    id: "2",
    contractNumber: "VTG-2024-002",
    offerId: "2024-002",
    offerNumber: "ANG-2024-002",
    customerName: "Schmidt Immobilien",
    customerEmail: "schmidt@immobilien.de",
    projectTitle: "Fassadensanierung Mehrfamilienhaus",
    contractAmount: 45600.0,
    status: "sent",
    createdDate: "2024-01-25",
    paymentTerms: {
      deposit: 25,
      milestone1: 35,
      milestone2: 25,
      final: 15,
    },
    contractTerms: "Erweiterte Vertragsbedingungen für Mehrfamilienhaus-Sanierung.",
    notes: "Vertrag zur Unterschrift versendet, Rückfrage zu Zahlungsbedingungen",
  },
  {
    id: "3",
    contractNumber: "VTG-2024-003",
    offerId: "2024-004",
    offerNumber: "ANG-2024-004",
    customerName: "Neubau GmbH",
    customerEmail: "info@neubau-gmbh.de",
    projectTitle: "Putzarbeiten Neubau",
    contractAmount: 18500.0,
    status: "active",
    createdDate: "2024-01-10",
    signedDate: "2024-01-12",
    startDate: "2024-01-15",
    completionDate: "2024-02-28",
    paymentTerms: {
      deposit: 20,
      milestone1: 50,
      milestone2: 0,
      final: 30,
    },
    contractTerms: "Standardvertragsbedingungen für Putzarbeiten.",
    notes: "Projekt läuft planmäßig, nächste Zahlung fällig am 15.02.",
  },
]

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>(mockContracts)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "sent":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "signed":
        return "bg-green-100 text-green-800 border-green-200"
      case "active":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "completed":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Edit className="h-4 w-4" />
      case "sent":
        return <Send className="h-4 w-4" />
      case "signed":
        return <Signature className="h-4 w-4" />
      case "active":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return "Entwurf"
      case "sent":
        return "Versendet"
      case "signed":
        return "Unterschrieben"
      case "active":
        return "Aktiv"
      case "completed":
        return "Abgeschlossen"
      case "cancelled":
        return "Storniert"
      default:
        return status
    }
  }

  const filteredContracts = contracts.filter((contract) => filterStatus === "all" || contract.status === filterStatus)

  const handleStatusUpdate = (contractId: string, newStatus: string) => {
    setContracts((contracts) =>
      contracts.map((contract) =>
        contract.id === contractId
          ? {
              ...contract,
              status: newStatus as any,
              ...(newStatus === "signed" && !contract.signedDate
                ? { signedDate: new Date().toISOString().split("T")[0] }
                : {}),
            }
          : contract,
      ),
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <Header />

        <main className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Vertragsmanagement</h1>
                <p className="text-muted-foreground">Verträge erstellen, verwalten und nachverfolgen</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Neuer Vertrag
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Contract List */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Verträge ({filteredContracts.length})</span>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle Status</SelectItem>
                        <SelectItem value="draft">Entwurf</SelectItem>
                        <SelectItem value="sent">Versendet</SelectItem>
                        <SelectItem value="signed">Unterschrieben</SelectItem>
                        <SelectItem value="active">Aktiv</SelectItem>
                        <SelectItem value="completed">Abgeschlossen</SelectItem>
                        <SelectItem value="cancelled">Storniert</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-3">
                      {filteredContracts.map((contract) => (
                        <div
                          key={contract.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedContract?.id === contract.id ? "border-accent bg-accent/5" : "hover:bg-muted/50"
                          }`}
                          onClick={() => setSelectedContract(contract)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">{contract.contractNumber}</Badge>
                                <Badge className={getStatusColor(contract.status)}>
                                  <span className="flex items-center gap-1">
                                    {getStatusIcon(contract.status)}
                                    {getStatusLabel(contract.status)}
                                  </span>
                                </Badge>
                              </div>
                              <h4 className="font-medium text-sm">{contract.customerName}</h4>
                              <p className="text-xs text-muted-foreground mb-2">{contract.projectTitle}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>
                                  €{contract.contractAmount.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                                </span>
                                <span>Erstellt: {contract.createdDate}</span>
                                {contract.signedDate && (
                                  <span className="text-green-600">Unterschrieben: {contract.signedDate}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {contract.notes && (
                            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded mt-2">
                              {contract.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Contract Details */}
            <div className="space-y-6">
              {selectedContract ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Vertragsdetails
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Vertragsnummer</label>
                        <p className="text-sm font-medium">{selectedContract.contractNumber}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Kunde</label>
                        <p className="text-sm">{selectedContract.customerName}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Projekt</label>
                        <p className="text-sm">{selectedContract.projectTitle}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Vertragssumme</label>
                        <p className="text-sm font-medium">
                          €{selectedContract.contractAmount.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Erstellt</label>
                          <p className="text-xs">{selectedContract.createdDate}</p>
                        </div>
                        {selectedContract.signedDate && (
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Unterschrieben</label>
                            <p className="text-xs">{selectedContract.signedDate}</p>
                          </div>
                        )}
                      </div>

                      {selectedContract.startDate && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Projektstart</label>
                            <p className="text-xs">{selectedContract.startDate}</p>
                          </div>
                          {selectedContract.completionDate && (
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Fertigstellung</label>
                              <p className="text-xs">{selectedContract.completionDate}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <Separator />

                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">Status ändern</label>
                        <Select
                          value={selectedContract.status}
                          onValueChange={(value) => handleStatusUpdate(selectedContract.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Entwurf</SelectItem>
                            <SelectItem value="sent">Versendet</SelectItem>
                            <SelectItem value="signed">Unterschrieben</SelectItem>
                            <SelectItem value="active">Aktiv</SelectItem>
                            <SelectItem value="completed">Abgeschlossen</SelectItem>
                            <SelectItem value="cancelled">Storniert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          <FileText className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          <Send className="h-4 w-4 mr-1" />
                          Senden
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Euro className="h-5 w-5" />
                        Zahlungsbedingungen
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Anzahlung:</span>
                          <span className="font-medium">
                            {selectedContract.paymentTerms.deposit}% (€
                            {(
                              (selectedContract.contractAmount * selectedContract.paymentTerms.deposit) /
                              100
                            ).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                            )
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>1. Abschlag:</span>
                          <span className="font-medium">
                            {selectedContract.paymentTerms.milestone1}% (€
                            {(
                              (selectedContract.contractAmount * selectedContract.paymentTerms.milestone1) /
                              100
                            ).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                            )
                          </span>
                        </div>
                        {selectedContract.paymentTerms.milestone2 > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>2. Abschlag:</span>
                            <span className="font-medium">
                              {selectedContract.paymentTerms.milestone2}% (€
                              {(
                                (selectedContract.contractAmount * selectedContract.paymentTerms.milestone2) /
                                100
                              ).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                              )
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span>Schlussrechnung:</span>
                          <span className="font-medium">
                            {selectedContract.paymentTerms.final}% (€
                            {(
                              (selectedContract.contractAmount * selectedContract.paymentTerms.final) /
                              100
                            ).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                            )
                          </span>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Vertragsbedingungen</label>
                        <p className="text-xs mt-1 bg-muted/50 p-2 rounded">{selectedContract.contractTerms}</p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Wählen Sie einen Vertrag aus der Liste</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
