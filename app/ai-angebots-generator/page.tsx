"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Upload,
  MessageSquare,
  Bot,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Send,
  Sparkles,
  Building2,
  Euro,
  Download,
} from "lucide-react"
import { useDropzone } from "react-dropzone"

interface AnalysisResult {
  projectType: string
  estimatedValue: number
  complexity: "low" | "medium" | "high"
  urgency: "low" | "medium" | "high"
  keyRequirements: string[]
  suggestedPositions: Array<{
    code: string
    title: string
    description: string
    quantity: number
    unit: string
    estimatedPrice: number
  }>
  riskFactors: string[]
  recommendations: string[]
}

interface GeneratedOffer {
  id: string
  projectTitle: string
  customer: {
    name: string
    address: string
    email?: string
    phone?: string
  }
  positions: Array<{
    id: string
    code: string
    title: string
    description: string
    quantity: number
    unit: string
    unitPrice: number
    totalPrice: number
    category: string
  }>
  subtotal: number
  riskPercent: number
  total: number
  textBlocks: {
    introduction: string
    advantages: string
    process: string
    terms: string
  }
}

export default function AIOfferGeneratorPage() {
  const [customerMessage, setCustomerMessage] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [generatedOffer, setGeneratedOffer] = useState<GeneratedOffer | null>(null)
  const [currentStep, setCurrentStep] = useState<"input" | "analyzing" | "results" | "offer">("input")

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/plain": [".txt"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    onDrop: (acceptedFiles) => {
      setUploadedFiles((prev) => [...prev, ...acceptedFiles])
    },
  })

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAnalyzeRequest = async () => {
    if (!customerMessage.trim() && uploadedFiles.length === 0) {
      return
    }

    setIsAnalyzing(true)
    setCurrentStep("analyzing")
    setAnalysisProgress(0)

    try {
      const progressSteps = [
        { progress: 20, message: "Dokumente werden verarbeitet..." },
        { progress: 40, message: "Kundenanfrage wird analysiert..." },
        { progress: 60, message: "Preisbuch wird durchsucht..." },
        { progress: 80, message: "Angebot wird kalkuliert..." },
        { progress: 100, message: "Analyse abgeschlossen!" },
      ]

      for (const step of progressSteps) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setAnalysisProgress(step.progress)
      }

      const formData = new FormData()
      formData.append("message", customerMessage)
      uploadedFiles.forEach((file, index) => {
        formData.append(`file_${index}`, file)
      })

      const response = await fetch("/api/ai-offer-analysis", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Analyse fehlgeschlagen")
      }

      const result = await response.json()
      setAnalysisResult(result)
      setCurrentStep("results")
    } catch (error) {
      console.error("AI analysis failed:", error)
      alert("Fehler bei der Analyse. Bitte versuchen Sie es erneut.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateOffer = async () => {
    if (!analysisResult) return

    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/ai-generate-offer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analysisResult,
          customerMessage,
          files: uploadedFiles.map((f) => f.name),
        }),
      })

      if (!response.ok) {
        throw new Error("Angebotserstellung fehlgeschlagen")
      }

      const offer = await response.json()
      setGeneratedOffer(offer)
      setCurrentStep("offer")
    } catch (error) {
      console.error("[v0] Offer generation failed:", error)
      alert("Fehler bei der Angebotserstellung. Bitte versuchen Sie es erneut.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleStartOver = () => {
    setCustomerMessage("")
    setUploadedFiles([])
    setAnalysisResult(null)
    setGeneratedOffer(null)
    setCurrentStep("input")
    setAnalysisProgress(0)
  }

  const handleExportOffer = () => {
    if (generatedOffer) {
      const offerData = encodeURIComponent(JSON.stringify(generatedOffer))
      window.open(`/offer-builder?data=${offerData}`, "_blank")
    }
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
                <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-accent" />
                  KI-Angebots-Generator
                </h1>
                <p className="text-muted-foreground">
                  Automatische Angebotserstellung durch KI-Analyse von Kundenanfragen und Dokumenten
                </p>
              </div>
              {currentStep !== "input" && (
                <Button variant="outline" onClick={handleStartOver}>
                  Neu starten
                </Button>
              )}
            </div>
          </div>

          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`flex items-center gap-2 ${currentStep === "input" ? "text-accent" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === "input"
                      ? "bg-accent text-accent-foreground"
                      : ["analyzing", "results", "offer"].includes(currentStep)
                        ? "bg-green-500 text-white"
                        : "bg-muted"
                  }`}
                >
                  {["analyzing", "results", "offer"].includes(currentStep) ? <CheckCircle className="h-4 w-4" /> : "1"}
                </div>
                <span className="text-sm font-medium">Eingabe</span>
              </div>

              <div
                className={`flex items-center gap-2 ${currentStep === "analyzing" ? "text-accent" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === "analyzing"
                      ? "bg-accent text-accent-foreground"
                      : ["results", "offer"].includes(currentStep)
                        ? "bg-green-500 text-white"
                        : "bg-muted"
                  }`}
                >
                  {currentStep === "analyzing" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : ["results", "offer"].includes(currentStep) ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    "2"
                  )}
                </div>
                <span className="text-sm font-medium">Analyse</span>
              </div>

              <div
                className={`flex items-center gap-2 ${currentStep === "results" ? "text-accent" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === "results"
                      ? "bg-accent text-accent-foreground"
                      : currentStep === "offer"
                        ? "bg-green-500 text-white"
                        : "bg-muted"
                  }`}
                >
                  {currentStep === "offer" ? <CheckCircle className="h-4 w-4" /> : "3"}
                </div>
                <span className="text-sm font-medium">Ergebnisse</span>
              </div>

              <div
                className={`flex items-center gap-2 ${currentStep === "offer" ? "text-accent" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === "offer" ? "bg-accent text-accent-foreground" : "bg-muted"
                  }`}
                >
                  4
                </div>
                <span className="text-sm font-medium">Angebot</span>
              </div>
            </div>
          </div>

          {/* Input Step */}
          {currentStep === "input" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Kundenanfrage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Beschreiben Sie die Kundenanfrage hier... 

Beispiel:
'Hallo, wir möchten unser Einfamilienhaus energetisch sanieren. Das Haus ist Baujahr 1985, ca. 180m² Wohnfläche. Wir benötigen eine neue Dämmung der Außenwände, neue Fenster und eine Modernisierung der Heizungsanlage. Das Projekt soll im Frühjahr 2025 starten. Können Sie uns ein Angebot erstellen?'"
                    value={customerMessage}
                    onChange={(e) => setCustomerMessage(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                  <div className="text-sm text-muted-foreground">
                    Je detaillierter die Beschreibung, desto präziser wird die KI-Analyse.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Dokumente hochladen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive ? "border-accent bg-accent/5" : "border-muted-foreground/25 hover:border-accent/50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">
                      {isDragActive ? "Dateien hier ablegen..." : "Dateien hier ablegen oder klicken zum Auswählen"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, Excel, Bilder, Textdateien (max. 10MB pro Datei)
                    </p>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium">Hochgeladene Dateien:</h4>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{file.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {(file.size / 1024 / 1024).toFixed(1)} MB
                            </Badge>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => removeFile(index)}>
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={handleAnalyzeRequest}
                    disabled={!customerMessage.trim() && uploadedFiles.length === 0}
                    className="w-full mt-4"
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    KI-Analyse starten
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analyzing Step */}
          {currentStep === "analyzing" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  KI analysiert Ihre Anfrage...
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={analysisProgress} className="w-full" />
                <div className="text-center text-sm text-muted-foreground">
                  {analysisProgress < 20 && "Dokumente werden verarbeitet..."}
                  {analysisProgress >= 20 && analysisProgress < 40 && "Kundenanfrage wird analysiert..."}
                  {analysisProgress >= 40 && analysisProgress < 60 && "Preisbuch wird durchsucht..."}
                  {analysisProgress >= 60 && analysisProgress < 80 && "Angebot wird kalkuliert..."}
                  {analysisProgress >= 80 && "Analyse wird abgeschlossen..."}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Step */}
          {currentStep === "results" && analysisResult && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Projekt-Analyse
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Projekttyp</label>
                        <p className="font-medium">{analysisResult.projectType}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Geschätzter Wert</label>
                        <p className="font-medium flex items-center gap-1">
                          <Euro className="h-4 w-4" />
                          {analysisResult.estimatedValue.toLocaleString("de-DE")}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Komplexität</label>
                        <Badge
                          variant={
                            analysisResult.complexity === "high"
                              ? "destructive"
                              : analysisResult.complexity === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {analysisResult.complexity === "high"
                            ? "Hoch"
                            : analysisResult.complexity === "medium"
                              ? "Mittel"
                              : "Niedrig"}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Dringlichkeit</label>
                        <Badge
                          variant={
                            analysisResult.urgency === "high"
                              ? "destructive"
                              : analysisResult.urgency === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {analysisResult.urgency === "high"
                            ? "Hoch"
                            : analysisResult.urgency === "medium"
                              ? "Mittel"
                              : "Niedrig"}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Hauptanforderungen</h4>
                      <ul className="space-y-1">
                        {analysisResult.keyRequirements.map((req, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {analysisResult.riskFactors.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          Risikofaktoren
                        </h4>
                        <ul className="space-y-1">
                          {analysisResult.riskFactors.map((risk, index) => (
                            <li key={index} className="text-sm flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>KI-Empfehlungen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Vorgeschlagene Positionen</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {analysisResult.suggestedPositions.map((position, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Badge variant="outline" className="mb-1">
                                {position.code}
                              </Badge>
                              <h4 className="font-medium text-sm">{position.title}</h4>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">€{position.estimatedPrice.toFixed(2)}</div>
                              <div className="text-xs text-muted-foreground">
                                {position.quantity} {position.unit}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{position.description}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium">Geschätzte Gesamtsumme:</span>
                      <span className="text-lg font-bold text-accent">
                        €
                        {analysisResult.suggestedPositions.reduce((sum, pos) => sum + pos.estimatedPrice, 0).toFixed(2)}
                      </span>
                    </div>

                    <Button onClick={handleGenerateOffer} className="w-full" disabled={isAnalyzing}>
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Angebot wird erstellt...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Vollständiges Angebot erstellen
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Generated Offer Step */}
          {currentStep === "offer" && generatedOffer && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Angebot erfolgreich erstellt
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Projekt</label>
                      <p className="font-medium">{generatedOffer.projectTitle}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Kunde</label>
                      <p className="font-medium">{generatedOffer.customer.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Positionen</label>
                      <p className="font-medium">{generatedOffer.positions.length} Stück</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Gesamtsumme</label>
                      <p className="font-medium text-accent">€{generatedOffer.total.toFixed(2)}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button onClick={handleExportOffer} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Im Angebots-Builder öffnen
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        PDF Export
                      </Button>
                      <Button variant="outline" size="sm">
                        <Send className="h-4 w-4 mr-2" />
                        Versenden
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Angebots-Vorschau</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-2">Einleitung</h4>
                        <p className="text-muted-foreground whitespace-pre-line">
                          {generatedOffer.textBlocks.introduction}
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium mb-2">Leistungsverzeichnis</h4>
                        <div className="space-y-2">
                          {generatedOffer.positions.slice(0, 3).map((position, index) => (
                            <div key={position.id} className="flex justify-between items-start p-2 bg-muted rounded">
                              <div className="flex-1">
                                <div className="font-medium">{position.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {position.quantity} {position.unit} × €{position.unitPrice.toFixed(2)}
                                </div>
                              </div>
                              <div className="font-medium">€{position.totalPrice.toFixed(2)}</div>
                            </div>
                          ))}
                          {generatedOffer.positions.length > 3 && (
                            <div className="text-center text-muted-foreground text-xs">
                              ... und {generatedOffer.positions.length - 3} weitere Positionen
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Zwischensumme:</span>
                          <span>€{generatedOffer.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Risikozuschlag ({generatedOffer.riskPercent}%):</span>
                          <span>€{((generatedOffer.subtotal * generatedOffer.riskPercent) / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-1">
                          <span>Gesamtsumme:</span>
                          <span>€{generatedOffer.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
