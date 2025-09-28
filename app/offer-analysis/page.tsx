"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Upload, FileText, X, CheckCircle, AlertCircle, Clock, TrendingUp, Eye } from "lucide-react"
import { useDropzone } from "react-dropzone"

interface UploadedOffer {
  id: string
  filename: string
  fileType: string
  fileSize: number
  uploadDate: string
  analysisStatus: "pending" | "processing" | "completed" | "failed"
  extractedPositions?: number
  totalAmount?: number
  currency?: string
  confidence?: number
}

export default function OfferAnalysisPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [offers, setOffers] = useState<UploadedOffer[]>([
    {
      id: "1",
      filename: "Angebot_Elektroinstallation_2024.pdf",
      fileType: "pdf",
      fileSize: 2456789,
      uploadDate: "2024-01-15",
      analysisStatus: "completed",
      extractedPositions: 45,
      totalAmount: 15750.0,
      currency: "EUR",
      confidence: 0.92,
    },
    {
      id: "2",
      filename: "Kostenvoranschlag_Heizung.xlsx",
      fileType: "excel",
      fileSize: 1234567,
      uploadDate: "2024-01-20",
      analysisStatus: "processing",
      extractedPositions: 23,
      totalAmount: 8900.0,
      currency: "EUR",
    },
    {
      id: "3",
      filename: "LV_Sanitaer_Neubau.x83",
      fileType: "gaeb",
      fileSize: 987654,
      uploadDate: "2024-01-22",
      analysisStatus: "pending",
    },
  ])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "application/octet-stream": [".x80", ".x81", ".x82", ".x83", ".x84"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: (acceptedFiles) => {
      setUploadedFiles((prev) => [...prev, ...acceptedFiles])
    },
  })

  const handleFileUpload = async () => {
    if (uploadedFiles.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i]

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress((i * 100 + progress) / uploadedFiles.length)
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        // Create new offer entry
        const newOffer: UploadedOffer = {
          id: Date.now().toString() + i,
          filename: file.name,
          fileType: file.name.split(".").pop() || "unknown",
          fileSize: file.size,
          uploadDate: new Date().toISOString().split("T")[0],
          analysisStatus: "pending",
        }

        setOffers((prev) => [newOffer, ...prev])

        // Start analysis process (simulate)
        setTimeout(() => {
          setOffers((prev) =>
            prev.map((offer) => (offer.id === newOffer.id ? { ...offer, analysisStatus: "processing" } : offer)),
          )
        }, 1000)

        setTimeout(() => {
          setOffers((prev) =>
            prev.map((offer) =>
              offer.id === newOffer.id
                ? {
                    ...offer,
                    analysisStatus: "completed",
                    extractedPositions: Math.floor(Math.random() * 50) + 10,
                    totalAmount: Math.floor(Math.random() * 20000) + 5000,
                    currency: "EUR",
                    confidence: Math.random() * 0.3 + 0.7,
                  }
                : offer,
            ),
          )
        }, 5000)
      }

      setUploadedFiles([])
      setUploadProgress(0)
    } catch (error) {
      console.error("[v0] Upload failed:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "processing":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      processing: "secondary",
      failed: "destructive",
      pending: "outline",
    } as const

    const labels = {
      completed: "Abgeschlossen",
      processing: "Wird analysiert",
      failed: "Fehler",
      pending: "Wartend",
    }

    return <Badge variant={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Angebots-Analyse</h1>
          <p className="text-muted-foreground">Laden Sie Angebote hoch und lassen Sie diese automatisch analysieren</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold">{offers.length}</div>
            <div className="text-sm text-muted-foreground">Angebote</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {offers.filter((o) => o.analysisStatus === "completed").length}
            </div>
            <div className="text-sm text-muted-foreground">Analysiert</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload & Analyse</TabsTrigger>
          <TabsTrigger value="history">Verlauf & Ergebnisse</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Angebote hochladen
              </CardTitle>
              <CardDescription>Unterstützte Formate: PDF, Excel (.xlsx, .xls), GAEB (.x80-.x84)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {isDragActive ? "Dateien hier ablegen..." : "Dateien hierher ziehen oder klicken zum Auswählen"}
                  </p>
                  <p className="text-sm text-muted-foreground">Maximale Dateigröße: 50MB pro Datei</p>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Ausgewählte Dateien ({uploadedFiles.length})</Label>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Upload läuft...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              <Button
                onClick={handleFileUpload}
                disabled={uploadedFiles.length === 0 || isUploading}
                className="w-full"
              >
                {isUploading ? "Wird hochgeladen..." : `${uploadedFiles.length} Datei(en) hochladen`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="grid gap-4">
            {offers.map((offer) => (
              <Card key={offer.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(offer.analysisStatus)}
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium">{offer.filename}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatFileSize(offer.fileSize)}</span>
                          <span>{offer.uploadDate}</span>
                          <span className="uppercase">{offer.fileType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(offer.analysisStatus)}
                      {offer.analysisStatus === "completed" && (
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      )}
                    </div>
                  </div>

                  {offer.analysisStatus === "completed" && (
                    <>
                      <Separator className="my-4" />
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{offer.extractedPositions}</div>
                          <div className="text-sm text-muted-foreground">Positionen</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {offer.totalAmount?.toLocaleString("de-DE", {
                              style: "currency",
                              currency: offer.currency || "EUR",
                            })}
                          </div>
                          <div className="text-sm text-muted-foreground">Gesamtsumme</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round((offer.confidence || 0) * 100)}%
                          </div>
                          <div className="text-sm text-muted-foreground">Genauigkeit</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium text-green-600">Marktkonform</span>
                          </div>
                          <div className="text-sm text-muted-foreground">Bewertung</div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
