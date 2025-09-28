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
  X,
} from "lucide-react"
import type { LVPosition, LVDocumentAnalysis } from "@/lib/ai/lv-analysis-service"

const FILE_VALIDATION = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/plain",
  ],
  allowedExtensions: [".pdf", ".xlsx", ".xls", ".x80", ".x81", ".x82", ".x83"],
  maxFiles: 5,
}

const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file size
  if (file.size > FILE_VALIDATION.maxSize) {
    return {
      isValid: false,
      error: `Datei "${file.name}" ist zu groß (${Math.round(file.size / 1024 / 1024)}MB). Maximale Größe: ${FILE_VALIDATION.maxSize / 1024 / 1024}MB.`,
    }
  }

  // Check file extension
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))
  if (!FILE_VALIDATION.allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: `Dateityp "${fileExtension}" wird nicht unterstützt. Erlaubte Formate: ${FILE_VALIDATION.allowedExtensions.join(", ")}.`,
    }
  }

  // Check MIME type (if available)
  if (file.type && !FILE_VALIDATION.allowedTypes.includes(file.type)) {
    // Only warn if extension is allowed but MIME type isn't
    if (FILE_VALIDATION.allowedExtensions.includes(fileExtension)) {
      console.warn(`File "${file.name}" has unexpected MIME type: ${file.type}`)
    } else {
      return {
        isValid: false,
        error: `Dateityp "${file.type}" wird nicht unterstützt.`,
      }
    }
  }

  // Check for empty files
  if (file.size === 0) {
    return {
      isValid: false,
      error: `Datei "${file.name}" ist leer.`,
    }
  }

  return { isValid: true }
}

const validateFiles = (files: File[]): { validFiles: File[]; errors: string[] } => {
  const validFiles: File[] = []
  const errors: string[] = []

  // Check total number of files
  if (files.length > FILE_VALIDATION.maxFiles) {
    errors.push(`Zu viele Dateien ausgewählt. Maximum: ${FILE_VALIDATION.maxFiles} Dateien.`)
    return { validFiles, errors }
  }

  // Validate each file
  files.forEach((file) => {
    const validation = validateFile(file)
    if (validation.isValid) {
      validFiles.push(file)
    } else if (validation.error) {
      errors.push(validation.error)
    }
  })

  // Check for duplicate file names
  const fileNames = validFiles.map((f) => f.name.toLowerCase())
  const duplicates = fileNames.filter((name, index) => fileNames.indexOf(name) !== index)
  if (duplicates.length > 0) {
    errors.push(`Doppelte Dateinamen gefunden: ${[...new Set(duplicates)].join(", ")}`)
  }

  return { validFiles, errors }
}

export default function LVAnalysisPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisResult, setAnalysisResult] = useState<LVDocumentAnalysis | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<LVPosition | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedPosition, setEditedPosition] = useState<LVPosition | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "clear" | "assumption" | "unclear">("all")
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setError(null)
    setValidationErrors([])

    if (files.length === 0) {
      return
    }

    const { validFiles, errors } = validateFiles(files)

    if (errors.length > 0) {
      setValidationErrors(errors)
      // Only set valid files if there are any
      if (validFiles.length > 0) {
        setUploadedFiles(validFiles)
      }
      return
    }

    setUploadedFiles(validFiles)
    console.log(`[v0] Successfully validated and uploaded ${validFiles.length} files`)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()

    const files = Array.from(event.dataTransfer.files)
    setError(null)
    setValidationErrors([])

    if (files.length === 0) {
      return
    }

    const { validFiles, errors } = validateFiles(files)

    if (errors.length > 0) {
      setValidationErrors(errors)
      if (validFiles.length > 0) {
        setUploadedFiles(validFiles)
      }
      return
    }

    setUploadedFiles(validFiles)
    console.log(`[v0] Successfully validated and dropped ${validFiles.length} files`)
  }

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0) return

    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setError(null)
    setValidationErrors([])

    try {
      const file = uploadedFiles[0] // Analyze first file
      const formData = new FormData()
      formData.append("file", file)

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 15
        })
      }, 500)

      const response = await fetch("/api/lv-analysis", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setAnalysisProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Analysis failed")
      }

      const { analysis } = await response.json()
      setAnalysisResult(analysis)
    } catch (error) {
      console.error("Analysis failed:", error)
      setError(error instanceof Error ? error.message : "Analysis failed")
    } finally {
      setIsAnalyzing(false)
      setTimeout(() => setAnalysisProgress(0), 2000)
    }
  }

  const handleEditPosition = (position: LVPosition) => {
    setSelectedPosition(position)
    setEditedPosition({ ...position })
    setIsEditing(true)
  }

  const handleSavePosition = () => {
    if (editedPosition && analysisResult) {
      const updatedPositions = analysisResult.positions.map((pos) =>
        pos.id === editedPosition.id ? editedPosition : pos,
      )

      setAnalysisResult({
        ...analysisResult,
        positions: updatedPositions,
      })

      setSelectedPosition(editedPosition)
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedPosition(null)
    setIsEditing(false)
  }

  const positions = analysisResult?.positions || []
  const filteredPositions = positions.filter((pos) => {
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

  const summary = analysisResult?.summary
  const totalClearPositions = summary?.clearPositions || 0
  const totalAssumptionPositions = summary?.assumptionPositions || 0
  const totalUnclearPositions = summary?.unclearPositions || 0

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
              <TabsTrigger value="positions">Positionen ({positions.length})</TabsTrigger>
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
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center transition-colors hover:border-accent"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">LV-Dateien hier ablegen</h3>
                    <p className="text-muted-foreground mb-2">
                      Unterstützte Formate: PDF, Excel (.xlsx, .xls), GAEB (.x80-.x83)
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Maximale Dateigröße: {FILE_VALIDATION.maxSize / 1024 / 1024}MB • Maximal{" "}
                      {FILE_VALIDATION.maxFiles} Dateien
                    </p>
                    <input
                      type="file"
                      multiple
                      accept={FILE_VALIDATION.allowedExtensions.join(",")}
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

                  {validationErrors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium">Dateivalidierung fehlgeschlagen:</p>
                          {validationErrors.map((error, index) => (
                            <p key={index} className="text-sm">
                              • {error}
                            </p>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Hochgeladene Dateien:</h4>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || "Unbekannter Typ"}
                            </p>
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

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
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
                            ? "KI analysiert Positionen..."
                            : analysisProgress < 90
                              ? "Preise werden kalkuliert..."
                              : "Analyse wird abgeschlossen..."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {analysisResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>Analyse-Ergebnis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
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

                    {summary?.estimatedValue && (
                      <div className="text-center pt-4 border-t">
                        <div className="text-lg font-semibold">
                          Geschätzter Projektwert: €{summary.estimatedValue.toLocaleString("de-DE")}
                        </div>
                        <div className="text-sm text-muted-foreground">Vollständigkeit: {summary.completeness}%</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="positions" className="space-y-6">
              {positions.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Keine Positionen analysiert</h3>
                    <p className="text-muted-foreground text-center">
                      Laden Sie ein LV-Dokument hoch und starten Sie die Analyse.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
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
                                {(position as any).unitPrice && (
                                  <span>
                                    €{(position as any).unitPrice.toFixed(2)}/{position.unit}
                                  </span>
                                )}
                              </div>
                              {(position as any).totalPrice && (
                                <span className="font-medium">€{(position as any).totalPrice.toFixed(2)}</span>
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
                                  {(selectedPosition as any).unitPrice
                                    ? `€${(selectedPosition as any).unitPrice.toFixed(2)}`
                                    : "Nicht kalkuliert"}
                                </p>
                              </div>
                            </div>

                            {(selectedPosition as any).totalPrice && (
                              <div>
                                <h4 className="font-medium mb-1">Gesamtpreis</h4>
                                <p className="text-lg font-bold text-accent">
                                  €{(selectedPosition as any).totalPrice.toFixed(2)}
                                </p>
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
                </>
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
                  {positions.length === 0 ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Analysieren Sie zuerst ein LV-Dokument, um Rückfragen zu generieren.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {totalUnclearPositions + totalAssumptionPositions} Positionen benötigen Klärung. Rückfragen
                          werden automatisch generiert.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-4">
                        {positions
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
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
