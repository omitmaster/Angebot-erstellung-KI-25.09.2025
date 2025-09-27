"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  Mail,
  MessageSquare,
  Paperclip,
  Bot,
  Clock,
  Inbox,
  Eye,
  User,
  Building,
  Phone,
  MapPin,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"

const inboxItems = [
  {
    id: 1,
    channel: "email",
    from: "info@mueller-bau.de",
    fromName: "Thomas Müller",
    company: "Müller Bau GmbH",
    subject: "Anfrage Dachsanierung Einfamilienhaus",
    preview:
      "Guten Tag, wir benötigen ein Angebot für die Sanierung unseres Daches. Das Haus ist ca. 150m² Grundfläche, Baujahr 1985. Die Dachziegel sind teilweise beschädigt und die Dämmung entspricht nicht mehr den aktuellen Standards...",
    fullContent: `Sehr geehrte Damen und Herren,

wir benötigen ein Angebot für die Sanierung unseres Daches. 

Objektdaten:
- Einfamilienhaus, Baujahr 1985
- Grundfläche ca. 150m²
- Satteldach, ca. 200m² Dachfläche
- Dachneigung ca. 45°

Gewünschte Arbeiten:
- Komplette Neueindeckung (Dachziegel sind teilweise beschädigt)
- Erneuerung der Dämmung (aktuell nur 8cm, soll auf 20cm erhöht werden)
- Neue Dachrinnen und Fallrohre
- Prüfung und ggf. Erneuerung der Dachsparren

Anbei finden Sie Fotos vom aktuellen Zustand und einen Grundriss.

Wir würden uns über ein zeitnahes Angebot freuen.

Mit freundlichen Grüßen
Thomas Müller`,
    attachments: [
      { name: "Dach_Fotos.zip", size: "5.2 MB", type: "image" },
      { name: "Grundriss_EG.pdf", size: "1.8 MB", type: "pdf" },
    ],
    timestamp: "vor 2 Stunden",
    status: "new",
    branch: null,
    aiAnalysis: null,
    priority: "medium",
    phone: "+49 40 12345678",
    address: "Musterstraße 123, 20095 Hamburg",
  },
  {
    id: 2,
    channel: "whatsapp",
    from: "+49 151 12345678",
    fromName: "Klaus Weber",
    company: "Familie Weber",
    subject: "Sprachnachricht - Badezimmer Renovierung",
    preview: "🎵 Audio-Nachricht (0:45) - Transkript verfügbar",
    fullContent:
      "Hallo, ich brauche ein Angebot für mein Badezimmer. Es soll komplett renoviert werden, neue Fliesen, neue Sanitärobjekte, alles. Das Bad ist ungefähr 8 Quadratmeter groß. Können Sie mal vorbeikommen und sich das anschauen?",
    attachments: [{ name: "Audio_Nachricht.mp3", size: "2.1 MB", type: "audio" }],
    timestamp: "vor 4 Stunden",
    status: "analyzed",
    branch: "Sanitär",
    aiAnalysis: {
      branch: "Sanitär",
      confidence: 0.95,
      extractedInfo: {
        projectType: "Badezimmer Komplettrenovierung",
        size: "ca. 8m²",
        scope: ["Fliesen erneuern", "Sanitärobjekte erneuern", "Komplettumbau"],
        nextSteps: ["Vor-Ort-Termin vereinbaren", "Detaillierte Wünsche abklären"],
      },
      missingInfo: ["Genaue Adresse", "Zeitrahmen", "Budget", "Spezielle Wünsche"],
      questions: [
        "Wann wäre ein Vor-Ort-Termin möglich?",
        "Haben Sie bereits konkrete Vorstellungen zu Fliesen und Sanitärobjekten?",
        "Gibt es einen gewünschten Zeitrahmen für die Renovierung?",
      ],
    },
    priority: "high",
    phone: "+49 151 12345678",
    address: "Unbekannt",
  },
  {
    id: 3,
    channel: "email",
    from: "schmidt@immobilien-gmbh.de",
    fromName: "Petra Schmidt",
    company: "Schmidt Immobilien GmbH",
    subject: "LV für Bürogebäude Neubau",
    preview: "Anbei finden Sie das Leistungsverzeichnis für unser neues Bürogebäude...",
    fullContent: `Sehr geehrte Damen und Herren,

anbei übersenden wir Ihnen das Leistungsverzeichnis für unser neues Bürogebäude in Berlin-Mitte.

Projektdaten:
- Bürogebäude, 4 Geschosse
- Bruttogeschossfläche: ca. 2.400m²
- Rohbau bereits erstellt
- Ausbaugewerke ausschreibungspflichtig

Das LV umfasst folgende Gewerke:
- Trockenbau
- Maler- und Lackierarbeiten  
- Bodenbeläge
- Elektroinstallation
- Sanitärinstallation

Angebotsfrist: 15.02.2024
Ausführungsbeginn: April 2024

Für Rückfragen stehen wir gerne zur Verfügung.

Mit freundlichen Grüßen
Petra Schmidt`,
    attachments: [
      { name: "LV_Buerogebäude_Berlin.xlsx", size: "3.4 MB", type: "excel" },
      { name: "Pläne_Ausbau.pdf", size: "12.8 MB", type: "pdf" },
      { name: "Raumbuch.pdf", size: "2.1 MB", type: "pdf" },
    ],
    timestamp: "gestern",
    status: "processed",
    branch: "Komplett",
    aiAnalysis: {
      branch: "Komplett",
      confidence: 0.98,
      extractedInfo: {
        projectType: "Bürogebäude Ausbau",
        size: "2.400m² BGF",
        scope: ["Trockenbau", "Maler", "Bodenbeläge", "Elektro", "Sanitär"],
        timeline: "Ausführung ab April 2024",
        deadline: "Angebot bis 15.02.2024",
      },
      missingInfo: [],
      questions: [],
    },
    priority: "high",
    phone: "+49 30 87654321",
    address: "Berlin-Mitte",
  },
]

export default function InboxPage() {
  const [selectedItem, setSelectedItem] = useState<(typeof inboxItems)[0] | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const filteredItems = inboxItems.filter((item) => {
    const matchesSearch =
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fromName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAnalyzeWithAI = async (itemId: number) => {
    setIsAnalyzing(true)
    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsAnalyzing(false)
    // In real implementation, this would call the AI service
    console.log(`Analyzing item ${itemId} with AI...`)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <Header />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Posteingang</h1>
            <p className="text-muted-foreground">Eingehende Anfragen und Nachrichten verwalten</p>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nachrichten durchsuchen..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="new">Neu</SelectItem>
                <SelectItem value="analyzed">Analysiert</SelectItem>
                <SelectItem value="processed">Verarbeitet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Inbox Items */}
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Channel Icon */}
                    <div className="flex-shrink-0">
                      {item.channel === "email" ? (
                        <Mail className="h-5 w-5 text-blue-500" />
                      ) : (
                        <MessageSquare className="h-5 w-5 text-green-500" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-foreground truncate">{item.subject}</h3>
                        {item.attachments.length > 0 && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Paperclip className="h-3 w-3" />
                            <span className="text-xs">{item.attachments.length}</span>
                          </div>
                        )}
                        <Badge
                          variant={
                            item.priority === "high"
                              ? "destructive"
                              : item.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {item.priority === "high" ? "Hoch" : item.priority === "medium" ? "Mittel" : "Niedrig"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {item.fromName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {item.company}
                        </div>
                        {item.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {item.phone}
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-foreground mb-3 line-clamp-2">{item.preview}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              item.status === "new" ? "default" : item.status === "analyzed" ? "secondary" : "outline"
                            }
                          >
                            {item.status === "new" ? "Neu" : item.status === "analyzed" ? "Analysiert" : "Verarbeitet"}
                          </Badge>

                          {item.branch && <Badge variant="outline">{item.branch}</Badge>}

                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {item.timestamp}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {item.status === "new" && (
                            <Button
                              size="sm"
                              className="gap-2"
                              onClick={() => handleAnalyzeWithAI(item.id)}
                              disabled={isAnalyzing}
                            >
                              {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                              Zum Agent
                            </Button>
                          )}

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => setSelectedItem(item)}>
                                <Eye className="h-4 w-4 mr-1" />
                                Öffnen
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh]">
                              <DialogHeader>
                                <DialogTitle>{item.subject}</DialogTitle>
                              </DialogHeader>

                              {selectedItem && (
                                <Tabs defaultValue="content" className="w-full">
                                  <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="content">Nachricht</TabsTrigger>
                                    <TabsTrigger value="analysis">AI-Analyse</TabsTrigger>
                                    <TabsTrigger value="attachments">Anhänge</TabsTrigger>
                                  </TabsList>

                                  <TabsContent value="content" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                                      <div>
                                        <div className="flex items-center gap-2 mb-2">
                                          <User className="h-4 w-4" />
                                          <span className="font-medium">{selectedItem.fromName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                          <Building className="h-4 w-4" />
                                          <span>{selectedItem.company}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                          <Mail className="h-4 w-4" />
                                          <span>{selectedItem.from}</span>
                                        </div>
                                      </div>
                                      <div>
                                        {selectedItem.phone && (
                                          <div className="flex items-center gap-2 mb-2">
                                            <Phone className="h-4 w-4" />
                                            <span>{selectedItem.phone}</span>
                                          </div>
                                        )}
                                        {selectedItem.address && (
                                          <div className="flex items-center gap-2 mb-2">
                                            <MapPin className="h-4 w-4" />
                                            <span>{selectedItem.address}</span>
                                          </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                          <Clock className="h-4 w-4" />
                                          <span>{selectedItem.timestamp}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <ScrollArea className="h-64 w-full border rounded-lg p-4">
                                      <div className="whitespace-pre-wrap text-sm">{selectedItem.fullContent}</div>
                                    </ScrollArea>
                                  </TabsContent>

                                  <TabsContent value="analysis" className="space-y-4">
                                    {selectedItem.aiAnalysis ? (
                                      <div className="space-y-4">
                                        <Card>
                                          <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                              <CheckCircle className="h-5 w-5 text-green-500" />
                                              Branche erkannt: {selectedItem.aiAnalysis.branch}
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="grid grid-cols-2 gap-4">
                                              <div>
                                                <h4 className="font-medium mb-2">Projekttyp</h4>
                                                <p className="text-sm text-muted-foreground">
                                                  {selectedItem.aiAnalysis.extractedInfo.projectType}
                                                </p>
                                              </div>
                                              <div>
                                                <h4 className="font-medium mb-2">Größe</h4>
                                                <p className="text-sm text-muted-foreground">
                                                  {selectedItem.aiAnalysis.extractedInfo.size}
                                                </p>
                                              </div>
                                            </div>

                                            <div className="mt-4">
                                              <h4 className="font-medium mb-2">Leistungsumfang</h4>
                                              <div className="flex flex-wrap gap-2">
                                                {selectedItem.aiAnalysis.extractedInfo.scope.map((item, index) => (
                                                  <Badge key={index} variant="outline">
                                                    {item}
                                                  </Badge>
                                                ))}
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>

                                        {selectedItem.aiAnalysis.missingInfo.length > 0 && (
                                          <Card>
                                            <CardHeader>
                                              <CardTitle className="text-lg flex items-center gap-2">
                                                <AlertCircle className="h-5 w-5 text-orange-500" />
                                                Fehlende Informationen
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                              <ul className="space-y-1">
                                                {selectedItem.aiAnalysis.missingInfo.map((info, index) => (
                                                  <li key={index} className="text-sm text-muted-foreground">
                                                    • {info}
                                                  </li>
                                                ))}
                                              </ul>
                                            </CardContent>
                                          </Card>
                                        )}

                                        {selectedItem.aiAnalysis.questions.length > 0 && (
                                          <Card>
                                            <CardHeader>
                                              <CardTitle className="text-lg">Vorgeschlagene Rückfragen</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                              <div className="space-y-2">
                                                {selectedItem.aiAnalysis.questions.map((question, index) => (
                                                  <div key={index} className="p-3 bg-muted rounded-lg">
                                                    <p className="text-sm">{question}</p>
                                                  </div>
                                                ))}
                                              </div>
                                            </CardContent>
                                          </Card>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="text-center py-8">
                                        <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">Noch nicht analysiert</h3>
                                        <p className="text-muted-foreground mb-4">
                                          Diese Nachricht wurde noch nicht vom AI-Agent analysiert.
                                        </p>
                                        <Button onClick={() => handleAnalyzeWithAI(selectedItem.id)}>
                                          <Bot className="h-4 w-4 mr-2" />
                                          Jetzt analysieren
                                        </Button>
                                      </div>
                                    )}
                                  </TabsContent>

                                  <TabsContent value="attachments" className="space-y-4">
                                    {selectedItem.attachments.length > 0 ? (
                                      <div className="space-y-3">
                                        {selectedItem.attachments.map((attachment, index) => (
                                          <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                                            <FileText className="h-8 w-8 text-muted-foreground" />
                                            <div className="flex-1">
                                              <p className="font-medium">{attachment.name}</p>
                                              <p className="text-sm text-muted-foreground">{attachment.size}</p>
                                            </div>
                                            <Button size="sm" variant="outline">
                                              Herunterladen
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-center py-8">
                                        <Paperclip className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">Keine Anhänge vorhanden</p>
                                      </div>
                                    )}
                                  </TabsContent>
                                </Tabs>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm || statusFilter !== "all" ? "Keine Ergebnisse gefunden" : "Keine neuen Nachrichten"}
                </h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm || statusFilter !== "all"
                    ? "Versuchen Sie andere Suchbegriffe oder Filter."
                    : "Alle eingehenden E-Mails und WhatsApp-Nachrichten werden hier angezeigt."}
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
