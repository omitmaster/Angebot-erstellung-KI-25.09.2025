"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Clock,
  Send,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  FileText,
  User,
} from "lucide-react"

interface FollowUpItem {
  id: string
  offerId: string
  offerNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  projectTitle: string
  offerAmount: number
  status: "pending" | "contacted" | "interested" | "declined" | "won"
  priority: "low" | "medium" | "high"
  lastContact: string
  nextFollowUp: string
  contactMethod: "email" | "phone" | "sms" | "whatsapp"
  notes: string
  followUpHistory: Array<{
    id: string
    date: string
    method: string
    content: string
    response?: string
    outcome: "no_response" | "interested" | "declined" | "callback_requested"
  }>
}

const mockFollowUpData: FollowUpItem[] = [
  {
    id: "1",
    offerId: "2024-001",
    offerNumber: "ANG-2024-001",
    customerName: "Müller Bau GmbH",
    customerEmail: "info@mueller-bau.de",
    customerPhone: "+49 40 12345678",
    projectTitle: "WDVS Sanierung Einfamilienhaus",
    offerAmount: 23880.13,
    status: "pending",
    priority: "high",
    lastContact: "2024-01-15",
    nextFollowUp: "2024-01-22",
    contactMethod: "email",
    notes: "Kunde war sehr interessiert, möchte Bedenkzeit bis Ende der Woche",
    followUpHistory: [
      {
        id: "1",
        date: "2024-01-15",
        method: "email",
        content: "Angebot versendet mit detaillierter Aufschlüsselung",
        outcome: "no_response",
      },
    ],
  },
  {
    id: "2",
    offerId: "2024-002",
    offerNumber: "ANG-2024-002",
    customerName: "Schmidt Immobilien",
    customerEmail: "schmidt@immobilien.de",
    customerPhone: "+49 30 98765432",
    projectTitle: "Fassadensanierung Mehrfamilienhaus",
    offerAmount: 45600.0,
    status: "interested",
    priority: "high",
    lastContact: "2024-01-18",
    nextFollowUp: "2024-01-25",
    contactMethod: "phone",
    notes: "Kunde möchte Termin vor Ort für detaillierte Besprechung",
    followUpHistory: [
      {
        id: "1",
        date: "2024-01-10",
        method: "email",
        content: "Angebot versendet",
        outcome: "no_response",
      },
      {
        id: "2",
        date: "2024-01-18",
        method: "phone",
        content: "Telefonische Nachfrage zum Angebot",
        response: "Kunde interessiert, möchte Vor-Ort-Termin",
        outcome: "interested",
      },
    ],
  },
  {
    id: "3",
    offerId: "2024-003",
    offerNumber: "ANG-2024-003",
    customerName: "Weber Hausverwaltung",
    customerEmail: "weber@hausverwaltung.de",
    customerPhone: "+49 89 11223344",
    projectTitle: "Balkonreparatur",
    offerAmount: 8900.5,
    status: "declined",
    priority: "low",
    lastContact: "2024-01-20",
    nextFollowUp: "",
    contactMethod: "email",
    notes: "Kunde hat sich für günstigeren Anbieter entschieden",
    followUpHistory: [
      {
        id: "1",
        date: "2024-01-12",
        method: "email",
        content: "Angebot versendet",
        outcome: "no_response",
      },
      {
        id: "2",
        date: "2024-01-20",
        method: "email",
        content: "Nachfrage zum Angebot",
        response: "Absage - zu teuer",
        outcome: "declined",
      },
    ],
  },
]

export default function FollowUpPage() {
  const [followUpItems, setFollowUpItems] = useState<FollowUpItem[]>(mockFollowUpData)
  const [selectedItem, setSelectedItem] = useState<FollowUpItem | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "contacted":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "interested":
        return "bg-green-100 text-green-800 border-green-200"
      case "declined":
        return "bg-red-100 text-red-800 border-red-200"
      case "won":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "contacted":
        return <Phone className="h-4 w-4" />
      case "interested":
        return <CheckCircle className="h-4 w-4" />
      case "declined":
        return <XCircle className="h-4 w-4" />
      case "won":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const filteredItems = followUpItems.filter((item) => {
    const statusMatch = filterStatus === "all" || item.status === filterStatus
    const priorityMatch = filterPriority === "all" || item.priority === filterPriority
    return statusMatch && priorityMatch
  })

  const handleStatusUpdate = (itemId: string, newStatus: string) => {
    setFollowUpItems((items) =>
      items.map((item) =>
        item.id === itemId
          ? { ...item, status: newStatus as any, lastContact: new Date().toISOString().split("T")[0] }
          : item,
      ),
    )
  }

  const handleAddFollowUp = (itemId: string, method: string, content: string) => {
    const newFollowUp = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      method,
      content,
      outcome: "no_response" as const,
    }

    setFollowUpItems((items) =>
      items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              followUpHistory: [...item.followUpHistory, newFollowUp],
              lastContact: newFollowUp.date,
            }
          : item,
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
                <h1 className="text-2xl font-bold text-foreground mb-2">Follow-up Management</h1>
                <p className="text-muted-foreground">Angebote nachverfolgen und Verträge verwalten</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Vertrag erstellen
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Follow-up hinzufügen
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Follow-up List */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Offene Follow-ups ({filteredItems.length})</span>
                    <div className="flex gap-2">
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle Status</SelectItem>
                          <SelectItem value="pending">Ausstehend</SelectItem>
                          <SelectItem value="contacted">Kontaktiert</SelectItem>
                          <SelectItem value="interested">Interessiert</SelectItem>
                          <SelectItem value="declined">Abgelehnt</SelectItem>
                          <SelectItem value="won">Gewonnen</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Priorität" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle</SelectItem>
                          <SelectItem value="high">Hoch</SelectItem>
                          <SelectItem value="medium">Mittel</SelectItem>
                          <SelectItem value="low">Niedrig</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-3">
                      {filteredItems.map((item) => (
                        <div
                          key={item.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedItem?.id === item.id ? "border-accent bg-accent/5" : "hover:bg-muted/50"
                          }`}
                          onClick={() => setSelectedItem(item)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">{item.offerNumber}</Badge>
                                <Badge className={getPriorityColor(item.priority)}>
                                  {item.priority === "high"
                                    ? "Hoch"
                                    : item.priority === "medium"
                                      ? "Mittel"
                                      : "Niedrig"}
                                </Badge>
                                <Badge className={getStatusColor(item.status)}>
                                  <span className="flex items-center gap-1">
                                    {getStatusIcon(item.status)}
                                    {item.status === "pending"
                                      ? "Ausstehend"
                                      : item.status === "contacted"
                                        ? "Kontaktiert"
                                        : item.status === "interested"
                                          ? "Interessiert"
                                          : item.status === "declined"
                                            ? "Abgelehnt"
                                            : "Gewonnen"}
                                  </span>
                                </Badge>
                              </div>
                              <h4 className="font-medium text-sm">{item.customerName}</h4>
                              <p className="text-xs text-muted-foreground mb-2">{item.projectTitle}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>€{item.offerAmount.toLocaleString("de-DE", { minimumFractionDigits: 2 })}</span>
                                <span>Letzter Kontakt: {item.lastContact}</span>
                                {item.nextFollowUp && (
                                  <span className="text-orange-600">Nächster Follow-up: {item.nextFollowUp}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {item.notes && (
                            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded mt-2">{item.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Details */}
            <div className="space-y-6">
              {selectedItem ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Kundendetails
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Kunde</label>
                        <p className="text-sm font-medium">{selectedItem.customerName}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Projekt</label>
                        <p className="text-sm">{selectedItem.projectTitle}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Angebotssumme</label>
                        <p className="text-sm font-medium">
                          €{selectedItem.offerAmount.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">E-Mail</label>
                          <p className="text-xs">{selectedItem.customerEmail}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Telefon</label>
                          <p className="text-xs">{selectedItem.customerPhone}</p>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">Status ändern</label>
                        <Select
                          value={selectedItem.status}
                          onValueChange={(value) => handleStatusUpdate(selectedItem.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Ausstehend</SelectItem>
                            <SelectItem value="contacted">Kontaktiert</SelectItem>
                            <SelectItem value="interested">Interessiert</SelectItem>
                            <SelectItem value="declined">Abgelehnt</SelectItem>
                            <SelectItem value="won">Gewonnen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          <Mail className="h-4 w-4 mr-1" />
                          E-Mail
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          <Phone className="h-4 w-4 mr-1" />
                          Anruf
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Follow-up Historie
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-64">
                        <div className="space-y-3">
                          {selectedItem.followUpHistory.map((history) => (
                            <div key={history.id} className="border-l-2 border-muted pl-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {history.method === "email"
                                    ? "E-Mail"
                                    : history.method === "phone"
                                      ? "Telefon"
                                      : history.method === "sms"
                                        ? "SMS"
                                        : "WhatsApp"}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{history.date}</span>
                              </div>
                              <p className="text-xs mb-1">{history.content}</p>
                              {history.response && (
                                <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                                  Antwort: {history.response}
                                </p>
                              )}
                              <Badge
                                variant="outline"
                                className={`text-xs mt-1 ${
                                  history.outcome === "interested"
                                    ? "border-green-200 text-green-700"
                                    : history.outcome === "declined"
                                      ? "border-red-200 text-red-700"
                                      : history.outcome === "callback_requested"
                                        ? "border-blue-200 text-blue-700"
                                        : "border-gray-200 text-gray-700"
                                }`}
                              >
                                {history.outcome === "no_response"
                                  ? "Keine Antwort"
                                  : history.outcome === "interested"
                                    ? "Interessiert"
                                    : history.outcome === "declined"
                                      ? "Abgelehnt"
                                      : "Rückruf gewünscht"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      <Separator className="my-3" />

                      <div className="space-y-2">
                        <Textarea placeholder="Neuen Follow-up hinzufügen..." className="text-sm" rows={2} />
                        <div className="flex gap-2">
                          <Select defaultValue="email">
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">E-Mail</SelectItem>
                              <SelectItem value="phone">Telefon</SelectItem>
                              <SelectItem value="sms">SMS</SelectItem>
                              <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" className="flex-1">
                            <Send className="h-4 w-4 mr-1" />
                            Hinzufügen
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Wählen Sie einen Follow-up aus der Liste</p>
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
