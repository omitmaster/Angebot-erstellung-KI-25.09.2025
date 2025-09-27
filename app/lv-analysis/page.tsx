"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import {
  Upload,
  FileText,
  Search,
  Bot,
  CheckCircle,
  AlertCircle,
  XCircle,
  Download,
  MessageSquare,
  Loader2,
  Eye,
  Edit,
  Save,
  X,
} from "lucide-react"

interface LVPosition {
  id: string
  code: string
  title: string
  description: string
  unit: string
  quantity?: number
  unitPrice?: number
  totalPrice?: number
  status: "clear" | "assumption" | "unclear"
  comments?: string
  questions?: string[]
  category: string
}

const mockLVData: LVPosition[] = [
  {
    id: "1",
    code: "01.001",
    title: "Arbeitsgerüst stellen und abbauen",
    description: "Arbeitsgerüst bis 7m Höhe, inkl. Auf- und Abbau",
    unit: "m²",
    quantity: 200,
    unitPrice: 8.5,
    totalPrice: 1700,
    status: "clear",
    category: "Gerüstarbeiten",
  },
  {
    id: "2",
    code: "02.001",
    title: "Untergrund vorbereiten",
    description: "Fassade reinigen, grundieren und spachteln",
    unit: "m²",
    quantity: 180,
    unitPrice: undefined,
    totalPrice: undefined,
    status: "assumption",
    comments: "Annahme: normaler Reinigungsaufwand",
    questions: ["Welcher Verschmutzungsgrad liegt vor?", "Sind Risse oder Schäden vorhanden?"],
    category: "Vorarbeiten",
  },
  {
    id: "3",
    code: "03.001",
    title: "WDVS kleben und dübeln",
    description: "14cm EPS-Dämmung vollflächig verkleben und mechanisch befestigen",
    unit: "m²",
    quantity: undefined,
    unitPrice: 45.0,
    totalPrice: undefined,
    status: "unclear",
    comments: "Menge nicht eindeutig aus Plänen ersichtlich",
    questions: ["Welche Fläche soll gedämmt werden?", "Sind Fenster- und Türöffnungen abzuziehen?"],
    category: "Dämmarbeiten",
  },
  {
    id: "4",
    code: "04.001",
    title: "Armierungsschicht auftragen",
    description: "Armierungsmörtel mit Glasfasergewebe",
    unit: "m²",
    quantity: 180,
    unitPrice: 12.5,
    totalPrice: 2250,
    status: "clear",
    category: "Putzarbeiten",
  },
  {
    id: "5",
    code: "05.001",
    title: "Oberputz auftragen",
    description: "Mineralischer Oberputz 2mm, gefilzt",
    unit: "m²",
    quantity: 180,
    unitPrice: 18.0,
    totalPrice: 3240,
    status: "assumption",
    comments: "Annahme: Standardputz ohne besondere Struktur",
    questions: ["Welche Putzstruktur ist gewünscht?", "Soll der Putz eingefärbt werden?"],
    category: "Putzarbeiten",
  },
]

export default function LVAnalysisPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [lvPositions, setLvPositions] = useState<LVPosition[]>([])
  const [selectedPosition, setSelectedPosition] = useState<LVPosition | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedPosition, setEditedPosition] = useState<LVPosition | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "clear" | "assumption" | "unclear">("all")

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(files)
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setIsAnalyzing(false)
          setLvPositions(mockLVData)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const handleEditPosition = (position: LVPosition) => {
    setSelectedPosition(position)
    setEditedPosition({ ...position })
    setIsEditing(true)
  }

  const handleSavePosition = () => {
    if (editedPosition) {
      setLvPositions((prev) => prev.map((pos) => (pos.id === editedPosition.id ? editedPosition : pos)))
      setSelectedPosition(editedPosition)
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedPosition(null)
    setIsEditing(false)
  }

  const filteredPositions = lvPositions.filter((pos) => {
    const matchesSearch =
      pos.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pos.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pos.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || pos.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "clear":
        return "bg-green-100 text-green-800"
      case "assumption":
        return "bg-yellow-100 text-yellow-800"
      case "unclear":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "clear":
        return <CheckCircle className="h-4 w-4" />
      case "assumption":
        return <AlertCircle className="h-4 w-4" />
      case "unclear":
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const totalClearPositions = lvPositions.filter((pos) => pos.status === "clear").length
  const totalAssumptionPositions = lvPositions.filter((pos) => pos.status === "assumption").length
  const totalUnclearPositions = lvPositions.filter((pos) => pos.status === "unclear").length

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <Header />

        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">LV-Analyse</h1>
            <p className="text-muted-foreground">Leistungsverzeichnisse analysieren und Positionen bewerten</p>
          </div>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload & Analyse</TabsTrigger>
              <TabsTrigger value="positions">Positionen ({lvPositions.length})</TabsTrigger>
              <TabsTrigger value="questions">
                Rückfragen ({totalUnclearPositions + totalAssumptionPositions})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dokumente hochladen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">LV-Dateien hier ablegen</h3>
                    <p className="text-muted-foreground mb-4">Unterstützte Formate: PDF, Excel, GAEB</p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.xlsx,.xls,.x80,.x81,.x82,.x83"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button asChild>
                        <span>Dateien auswählen</span>
                      </Button>
                    </label>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Hochgeladene Dateien:</h4>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {uploadedFiles.length > 0 && (
                    <Button onClick={handleAnalyze} className="w-full" disabled={isAnalyzing}>
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analysiere LV...
                        </>
                      ) : (
                        <>
                          <Bot className="mr-2 h-4 w-4" />
                          LV analysieren
                        </>
                      )}
                    </Button>
                  )}

                  {isAnalyzing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Analyse-Fortschritt</span>
                        <span>{analysisProgress}%</span>
                      </div>
                      <Progress value={analysisProgress} className="w-full" />
                      <p className="text-sm text-muted-foreground">
                        {analysisProgress < 30
                          ? "Dokument wird geparst..."
                          : analysisProgress < 60
                            ? "Positionen werden extrahiert..."
                            : analysisProgress < 90
                              ? "Preise werden kalkuliert..."
                              : "Analyse wird abgeschlossen..."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {lvPositions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Analyse-Ergebnis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{totalClearPositions}</div>
                        <div className="text-sm text-muted-foreground">Klar</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{totalAssumptionPositions}</div>
                        <div className="text-sm text-muted-foreground">Annahmen</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{totalUnclearPositions}</div>
                        <div className="text-sm text-muted-foreground">Unklar</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="positions" className="space-y-6">
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Positionen durchsuchen..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                  >
                    Alle
                  </Button>
                  <Button
                    variant={statusFilter === "clear" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("clear")}
                  >
                    Klar
                  </Button>
                  <Button
                    variant={statusFilter === "assumption" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("assumption")}
                  >
                    Annahmen
                  </Button>
                  <Button
                    variant={statusFilter === "unclear" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("unclear")}
                  >
                    Unklar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {filteredPositions.map((position) => (
                    <Card
                      key={position.id}
                      className={`cursor-pointer transition-all ${
                        selectedPosition?.id === position.id ? "ring-2 ring-accent" : "hover:shadow-md"
                      }`}
                      onClick={() => setSelectedPosition(position)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{position.code}</Badge>
                            <Badge className={getStatusColor(position.status)}>
                              {getStatusIcon(position.status)}
                              <span className="ml-1">
                                {position.status === "clear"
                                  ? "Klar"
                                  : position.status === "assumption"
                                    ? "Annahme"
                                    : "Unklar"}
                              </span>
                            </Badge>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => handleEditPosition(position)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>

                        <h3 className="font-medium mb-1">{position.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{position.description}</p>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <span>
                              {position.quantity || "?"} {position.unit}
                            </span>
                            {position.unitPrice && (
                              <span>
                                €{position.unitPrice.toFixed(2)}/{position.unit}
                              </span>
                            )}
                          </div>
                          {position.totalPrice && (
                            <span className="font-medium">€{position.totalPrice.toFixed(2)}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="lg:sticky lg:top-6">
                  {selectedPosition ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          Position Details
                          <Button size="sm" variant="outline" onClick={() => handleEditPosition(selectedPosition)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Bearbeiten
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{selectedPosition.code}</Badge>
                            <Badge className={getStatusColor(selectedPosition.status)}>
                              {getStatusIcon(selectedPosition.status)}
                              <span className="ml-1">
                                {selectedPosition.status === "clear"
                                  ? "Klar"
                                  : selectedPosition.status === "assumption"
                                    ? "Annahme"
                                    : "Unklar"}
                              </span>
                            </Badge>
                          </div>
                          <h3 className="font-medium text-lg">{selectedPosition.title}</h3>
                        </div>

                        <div>
                          <h4 className="font-medium mb-1">Beschreibung</h4>
                          <p className="text-sm text-muted-foreground">{selectedPosition.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-1">Menge</h4>
                            <p className="text-sm">
                              {selectedPosition.quantity || "Nicht definiert"} {selectedPosition.unit}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Einheitspreis</h4>
                            <p className="text-sm">
                              {selectedPosition.unitPrice
                                ? `€${selectedPosition.unitPrice.toFixed(2)}`
                                : "Nicht kalkuliert"}
                            </p>
                          </div>
                        </div>

                        {selectedPosition.totalPrice && (
                          <div>
                            <h4 className="font-medium mb-1">Gesamtpreis</h4>
                            <p className="text-lg font-bold text-accent">€{selectedPosition.totalPrice.toFixed(2)}</p>
                          </div>
                        )}

                        {selectedPosition.comments && (
                          <div>
                            <h4 className="font-medium mb-1">Kommentare</h4>
                            <p className="text-sm text-muted-foreground">{selectedPosition.comments}</p>
                          </div>
                        )}

                        {selectedPosition.questions && selectedPosition.questions.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Offene Fragen</h4>
                            <div className="space-y-2">
                              {selectedPosition.questions.map((question, index) => (
                                <div key={index} className="p-2 bg-muted rounded text-sm">
                                  {question}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Eye className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Position auswählen</h3>
                        <p className="text-muted-foreground text-center">
                          Wählen Sie eine Position aus der Liste, um Details anzuzeigen.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Edit Position Dialog */}
              {isEditing && editedPosition && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Position bearbeiten
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Code</label>
                          <Input
                            value={editedPosition.code}
                            onChange={(e) => setEditedPosition({ ...editedPosition, code: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Status</label>
                          <select
                            className="w-full p-2 border rounded-md"
                            value={editedPosition.status}
                            onChange={(e) =>
                              setEditedPosition({
                                ...editedPosition,
                                status: e.target.value as "clear" | "assumption" | "unclear",
                              })
                            }
                          >
                            <option value="clear">Klar</option>
                            <option value="assumption">Annahme</option>
                            <option value="unclear">Unklar</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1 block">Titel</label>
                        <Input
                          value={editedPosition.title}
                          onChange={(e) => setEditedPosition({ ...editedPosition, title: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1 block">Beschreibung</label>
                        <Textarea
                          value={editedPosition.description}
                          onChange={(e) => setEditedPosition({ ...editedPosition, description: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Menge</label>
                          <Input
                            type="number"
                            value={editedPosition.quantity || ""}
                            onChange={(e) =>
                              setEditedPosition({
                                ...editedPosition,
                                quantity: Number.parseFloat(e.target.value) || undefined,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Einheit</label>
                          <Input
                            value={editedPosition.unit}
                            onChange={(e) => setEditedPosition({ ...editedPosition, unit: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Einheitspreis (€)</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={editedPosition.unitPrice || ""}
                            onChange={(e) =>
                              setEditedPosition({
                                ...editedPosition,
                                unitPrice: Number.parseFloat(e.target.value) || undefined,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1 block">Kommentare</label>
                        <Textarea
                          value={editedPosition.comments || ""}
                          onChange={(e) => setEditedPosition({ ...editedPosition, comments: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleSavePosition} className="flex-1">
                          <Save className="h-4 w-4 mr-2" />
                          Speichern
                        </Button>
                        <Button variant="outline" onClick={handleCancelEdit} className="flex-1 bg-transparent">
                          Abbrechen
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="questions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Rückfragen generieren
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {totalUnclearPositions + totalAssumptionPositions} Positionen benötigen Klärung. Rückfragen werden
                      automatisch generiert.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    {lvPositions
                      .filter((pos) => pos.status !== "clear" && pos.questions && pos.questions.length > 0)
                      .map((position) => (
                        <Card key={position.id}>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Badge variant="outline">{position.code}</Badge>
                              {position.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <h4 className="font-medium">Offene Fragen:</h4>
                              {position.questions?.map((question, index) => (
                                <div key={index} className="p-3 bg-muted rounded-lg">
                                  <p className="text-sm">{question}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Rückfragen per E-Mail senden
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Fragenliste exportieren
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
