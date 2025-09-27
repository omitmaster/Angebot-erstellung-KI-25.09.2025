"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Upload,
  FileText,
  Search,
  Download,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Euro,
  Calendar,
  Building,
} from "lucide-react"

// Mock data für die Preisdatenbank
const mockOfferHistory = [
  {
    id: "1",
    filename: "Angebot_Mustermann_Badezimmer_2024.pdf",
    customerName: "Familie Mustermann",
    projectType: "Badezimmer Sanierung",
    totalAmount: 15750.0,
    offerDate: "2024-01-15",
    aiAnalysisStatus: "completed",
    extractedPositions: 12,
    branchTags: ["Sanitär", "Fliesen", "Elektro"],
    uploadDate: "2024-01-20",
  },
  {
    id: "2",
    filename: "Angebot_Schmidt_Küche_2024.pdf",
    customerName: "Herr Schmidt",
    projectType: "Küchen Renovation",
    totalAmount: 28900.0,
    offerDate: "2024-02-03",
    aiAnalysisStatus: "completed",
    extractedPositions: 18,
    branchTags: ["Küche", "Elektro", "Wasser"],
    uploadDate: "2024-02-05",
  },
  {
    id: "3",
    filename: "Angebot_Weber_Dachausbau_2024.pdf",
    customerName: "Familie Weber",
    projectType: "Dachgeschoss Ausbau",
    totalAmount: 45200.0,
    offerDate: "2024-02-20",
    aiAnalysisStatus: "processing",
    extractedPositions: 0,
    branchTags: ["Trockenbau", "Dämmung", "Elektro"],
    uploadDate: "2024-02-22",
  },
]

const statusColors = {
  completed: "bg-green-100 text-green-800",
  processing: "bg-yellow-100 text-yellow-800",
  pending: "bg-gray-100 text-gray-800",
  failed: "bg-red-100 text-red-800",
}

const statusIcons = {
  completed: CheckCircle,
  processing: Clock,
  pending: Clock,
  failed: AlertCircle,
}

export default function PriceDatabasePage() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const handleFileUpload = async () => {
    if (!selectedFiles) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simuliere Upload-Prozess
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      setUploadProgress(i)
    }

    setIsUploading(false)
    setSelectedFiles(null)
    setUploadProgress(0)
  }

  const filteredOffers = mockOfferHistory.filter((offer) => {
    const matchesSearch =
      offer.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.projectType.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesBranch =
      selectedBranch === "all" ||
      offer.branchTags.some((tag) => tag.toLowerCase().includes(selectedBranch.toLowerCase()))

    const matchesStatus = selectedStatus === "all" || offer.aiAnalysisStatus === selectedStatus

    return matchesSearch && matchesBranch && matchesStatus
  })

  const totalOffers = mockOfferHistory.length
  const completedAnalyses = mockOfferHistory.filter((o) => o.aiAnalysisStatus === "completed").length
  const totalValue = mockOfferHistory.reduce((sum, offer) => sum + offer.totalAmount, 0)
  const avgOfferValue = totalValue / totalOffers

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Preisdatenbank</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Angebots-Historie für intelligente KI-basierte Preisfindung
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90">
              <Upload className="mr-2 h-4 w-4" />
              PDFs hochladen
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Angebots-PDFs hochladen</DialogTitle>
              <DialogDescription>
                Laden Sie Ihre bisherigen Angebote hoch, damit die KI daraus lernen und bessere Preise vorschlagen kann.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="pdf-upload">PDF-Dateien auswählen</Label>
                <Input
                  id="pdf-upload"
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={(e) => setSelectedFiles(e.target.files)}
                />
              </div>

              {selectedFiles && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{selectedFiles.length} Datei(en) ausgewählt</p>
                  {Array.from(selectedFiles).map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      {file.name}
                    </div>
                  ))}
                </div>
              )}

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Upload läuft...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  onClick={handleFileUpload}
                  disabled={!selectedFiles || isUploading}
                  className="bg-accent hover:bg-accent/90"
                >
                  {isUploading ? "Wird hochgeladen..." : "Hochladen"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiken */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Angebote</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOffers}</div>
            <p className="text-xs text-muted-foreground">PDFs in der Datenbank</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analysiert</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedAnalyses}</div>
            <p className="text-xs text-muted-foreground">KI-Analyse abgeschlossen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtwert</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Aller Angebote</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ø Angebotswert</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{Math.round(avgOfferValue).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Durchschnittlicher Wert</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="analysis">KI-Analyse</TabsTrigger>
          <TabsTrigger value="search">Preissuche</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Filter und Suche */}
          <Card>
            <CardHeader>
              <CardTitle>Filter & Suche</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Suche</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Dateiname, Kunde oder Projekttyp..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="branch-filter">Gewerk</Label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Gewerke</SelectItem>
                      <SelectItem value="sanitär">Sanitär</SelectItem>
                      <SelectItem value="elektro">Elektro</SelectItem>
                      <SelectItem value="küche">Küche</SelectItem>
                      <SelectItem value="trockenbau">Trockenbau</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Status</SelectItem>
                      <SelectItem value="completed">Abgeschlossen</SelectItem>
                      <SelectItem value="processing">In Bearbeitung</SelectItem>
                      <SelectItem value="pending">Wartend</SelectItem>
                      <SelectItem value="failed">Fehler</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Angebots-Liste */}
          <div className="space-y-4">
            {filteredOffers.map((offer) => {
              const StatusIcon = statusIcons[offer.aiAnalysisStatus as keyof typeof statusIcons]

              return (
                <Card key={offer.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                          <FileText className="h-6 w-6 text-accent" />
                        </div>

                        <div className="space-y-1">
                          <h3 className="font-semibold">{offer.filename}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {offer.customerName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(offer.offerDate).toLocaleDateString("de-DE")}
                            </div>
                            <div className="flex items-center gap-1">
                              <Euro className="h-3 w-3" />€{offer.totalAmount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusColors[offer.aiAnalysisStatus as keyof typeof statusColors]}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {offer.aiAnalysisStatus === "completed" && "Analysiert"}
                            {offer.aiAnalysisStatus === "processing" && "Wird analysiert"}
                            {offer.aiAnalysisStatus === "pending" && "Wartend"}
                            {offer.aiAnalysisStatus === "failed" && "Fehler"}
                          </div>
                          {offer.aiAnalysisStatus === "completed" && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {offer.extractedPositions} Positionen extrahiert
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1">
                      {offer.branchTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>KI-Analyse Einstellungen</CardTitle>
              <CardDescription>
                Konfigurieren Sie, wie die KI Ihre Angebote analysiert und Preise extrahiert.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="confidence-threshold">Vertrauensschwelle</Label>
                  <Select defaultValue="0.7">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">50% - Niedrig</SelectItem>
                      <SelectItem value="0.7">70% - Standard</SelectItem>
                      <SelectItem value="0.9">90% - Hoch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auto-analysis">Automatische Analyse</Label>
                  <Select defaultValue="enabled">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Aktiviert</SelectItem>
                      <SelectItem value="disabled">Deaktiviert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="bg-accent hover:bg-accent/90">Alle PDFs neu analysieren</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Intelligente Preissuche</CardTitle>
              <CardDescription>Suchen Sie nach ähnlichen Positionen in Ihrer Angebots-Historie.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search-query">Suchbegriff</Label>
                <Textarea
                  id="search-query"
                  placeholder="z.B. 'Badezimmer Fliesen verlegen 20qm' oder 'Küche Elektroinstallation'"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="search-branch">Gewerk</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Gewerk auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sanitär">Sanitär</SelectItem>
                      <SelectItem value="elektro">Elektro</SelectItem>
                      <SelectItem value="küche">Küche</SelectItem>
                      <SelectItem value="trockenbau">Trockenbau</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price-range">Preisbereich</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Preisbereich" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1000">€0 - €1.000</SelectItem>
                      <SelectItem value="1000-5000">€1.000 - €5.000</SelectItem>
                      <SelectItem value="5000-15000">€5.000 - €15.000</SelectItem>
                      <SelectItem value="15000+">€15.000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full bg-accent hover:bg-accent/90">
                <Search className="mr-2 h-4 w-4" />
                Preise suchen
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
