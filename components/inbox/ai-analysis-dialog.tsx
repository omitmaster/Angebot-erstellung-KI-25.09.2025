"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bot,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Send,
  Loader2,
  Building2,
  Calculator,
  FileText,
} from "lucide-react"

interface AIAnalysisDialogProps {
  isOpen: boolean
  onClose: () => void
  item: any
}

export function AIAnalysisDialog({ isOpen, onClose, item }: AIAnalysisDialogProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState("")
  const [customQuestions, setCustomQuestions] = useState("")
  const [analysisStep, setAnalysisStep] = useState<"analyzing" | "results" | "questions">("analyzing")

  const branches = ["Maler", "Elektrik", "Sanitär", "Boden", "Tischler", "Fenster", "Fassade", "Dach", "Komplett"]

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setAnalysisStep("analyzing")

    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setIsAnalyzing(false)
    setAnalysisStep("results")
  }

  const handleSendQuestions = async () => {
    setIsAnalyzing(true)

    // Simulate sending questions
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsAnalyzing(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-accent" />
            AI-Agent Analyse
          </DialogTitle>
        </DialogHeader>

        {analysisStep === "analyzing" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nachricht analysieren</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Von: {item?.fromName}</h4>
                  <h4 className="font-medium mb-2">Betreff: {item?.subject}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">{item?.preview}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Branche vorauswählen (optional)</label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger>
                      <SelectValue placeholder="Branche automatisch erkennen lassen" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleAnalyze} className="w-full" disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analysiere mit AI...
                    </>
                  ) : (
                    <>
                      <Bot className="mr-2 h-4 w-4" />
                      Analyse starten
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {analysisStep === "results" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Analyse abgeschlossen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Erkannte Branche</h4>
                    <Badge className="bg-accent text-accent-foreground">Sanitär</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Konfidenz: 95%</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Projekttyp</h4>
                    <p className="text-sm">Badezimmer Komplettrenovierung</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Extrahierte Informationen</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Größe: ca. 8m²</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Umfang: Fliesen, Sanitärobjekte, Komplettumbau</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    Fehlende Informationen
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Genaue Adresse für Vor-Ort-Termin</li>
                    <li>• Gewünschter Zeitrahmen</li>
                    <li>• Budget-Vorstellungen</li>
                    <li>• Spezielle Wünsche (barrierefrei, etc.)</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setAnalysisStep("questions")} className="flex-1">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Rückfragen generieren
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <FileText className="mr-2 h-4 w-4" />
                    LV-Vorlage erstellen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {analysisStep === "questions" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rückfragen generieren</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Vorgeschlagene Fragen:</h4>
                  <div className="space-y-3">
                    {[
                      "Wann wäre ein Vor-Ort-Termin zur Besichtigung möglich?",
                      "Haben Sie bereits konkrete Vorstellungen zu Fliesen und Sanitärobjekten?",
                      "Gibt es einen gewünschten Zeitrahmen für die Renovierung?",
                      "Soll das Bad barrierefrei gestaltet werden?",
                      "Welches Budget haben Sie für die Renovierung eingeplant?",
                    ].map((question, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{question}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Zusätzliche Fragen (optional)</label>
                  <Textarea
                    placeholder="Weitere spezifische Fragen eingeben..."
                    value={customQuestions}
                    onChange={(e) => setCustomQuestions(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSendQuestions} className="flex-1" disabled={isAnalyzing}>
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sende E-Mail...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Rückfragen per E-Mail senden
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setAnalysisStep("results")}>
                    Zurück
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
