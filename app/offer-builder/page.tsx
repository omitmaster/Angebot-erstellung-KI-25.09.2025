"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { FileText, Download, Send, Eye, Plus, Trash2, Calculator, Building2, Euro, Percent, Save } from "lucide-react"
import { PDFGenerator } from "@/lib/pdf-generator"

interface OfferPosition {
  id: string
  code: string
  title: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  category: string
}

interface OfferData {
  id: string
  projectTitle: string
  customer: {
    name: string
    person: string
    address: string
    email: string
    phone: string
  }
  projectAddress: string
  offerNumber: string
  date: string
  validUntil: string
  positions: OfferPosition[]
  subtotalLabor: number
  subtotalMaterial: number
  riskPercent: number
  discountPercent: number
  total: number
  textBlocks: {
    introduction: string
    advantages: string
    process: string
    terms: string
  }
}

const mockOfferData: OfferData = {
  id: "2024-001",
  projectTitle: "WDVS Sanierung Einfamilienhaus",
  customer: {
    name: "Müller Bau GmbH",
    person: "Thomas Müller",
    address: "Musterstraße 123\n20095 Hamburg",
    email: "info@mueller-bau.de",
    phone: "+49 40 12345678",
  },
  projectAddress: "Musterstraße 123, 20095 Hamburg",
  offerNumber: "ANG-2024-001",
  date: new Date().toISOString().split("T")[0],
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  positions: [
    {
      id: "1",
      code: "01.001",
      title: "Arbeitsgerüst stellen und abbauen",
      description: "Arbeitsgerüst bis 7m Höhe, inkl. Auf- und Abbau",
      quantity: 200,
      unit: "m²",
      unitPrice: 8.5,
      totalPrice: 1700,
      category: "Gerüstarbeiten",
    },
    {
      id: "2",
      code: "02.001",
      title: "Untergrund vorbereiten",
      description: "Fassade reinigen, grundieren und spachteln",
      quantity: 180,
      unit: "m²",
      unitPrice: 12.0,
      totalPrice: 2160,
      category: "Vorarbeiten",
    },
    {
      id: "3",
      code: "03.001",
      title: "WDVS kleben und dübeln",
      description: "14cm EPS-Dämmung vollflächig verkleben und mechanisch befestigen",
      quantity: 180,
      unit: "m²",
      unitPrice: 45.0,
      totalPrice: 8100,
      category: "Dämmarbeiten",
    },
    {
      id: "4",
      code: "04.001",
      title: "Armierungsschicht auftragen",
      description: "Armierungsmörtel mit Glasfasergewebe",
      quantity: 180,
      unit: "m²",
      unitPrice: 12.5,
      totalPrice: 2250,
      category: "Putzarbeiten",
    },
    {
      id: "5",
      code: "05.001",
      title: "Oberputz auftragen",
      description: "Mineralischer Oberputz 2mm, gefilzt",
      quantity: 180,
      unit: "m²",
      unitPrice: 18.0,
      totalPrice: 3240,
      category: "Putzarbeiten",
    },
  ],
  subtotalLabor: 12450,
  subtotalMaterial: 5000,
  riskPercent: 15,
  discountPercent: 0,
  total: 20067.5,
  textBlocks: {
    introduction:
      "Sehr geehrter Herr Müller,\n\nvielen Dank für Ihr Interesse an unseren Leistungen. Gerne unterbreiten wir Ihnen nachfolgendes Angebot für die WDVS-Sanierung Ihres Einfamilienhauses.",
    advantages:
      "Unsere Vorteile:\n• Über 20 Jahre Erfahrung im Bereich WDVS\n• Zertifizierte Fachkräfte\n• Hochwertige Materialien\n• Umfassende Gewährleistung\n• Termingerechte Ausführung",
    process:
      "Projektablauf:\n1. Auftragsbestätigung und Terminplanung\n2. Materialbestellung und Anlieferung\n3. Gerüststellung\n4. Ausführung der Arbeiten\n5. Abnahme und Übergabe",
    terms:
      "Zahlungsbedingungen:\n• 30% Anzahlung bei Auftragserteilung\n• 40% nach Gerüststellung\n• 30% nach Fertigstellung\n\nGewährleistung: 5 Jahre auf alle Arbeiten\nAngebotsgültigkeit: 30 Tage",
  },
}

export default function OfferBuilderPage() {
  const [offerData, setOfferData] = useState<OfferData>(mockOfferData)
  const [selectedPosition, setSelectedPosition] = useState<OfferPosition | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("positions")

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const dataParam = urlParams.get("data")

    if (dataParam) {
      try {
        const importedData = JSON.parse(decodeURIComponent(dataParam))
        console.log("[v0] Loading AI-generated offer data:", importedData)

        // Convert AI-generated data to offer format
        const convertedData: OfferData = {
          ...offerData,
          projectTitle: importedData.projectTitle,
          customer: importedData.customer,
          positions: importedData.positions.map((pos: any) => ({
            ...pos,
            category: pos.category || "Sonstige",
          })),
          subtotalLabor: importedData.subtotal * 0.7,
          subtotalMaterial: importedData.subtotal * 0.3,
          riskPercent: importedData.riskPercent,
          total: importedData.total,
          textBlocks: importedData.textBlocks,
        }

        setOfferData(convertedData)
        console.log("[v0] AI-generated offer data loaded successfully")
      } catch (error) {
        console.error("[v0] Error loading AI-generated data:", error)
      }
    }
  }, [])

  const handleAddPosition = () => {
    const newPosition: OfferPosition = {
      id: Date.now().toString(),
      code: "",
      title: "",
      description: "",
      quantity: 1,
      unit: "m²",
      unitPrice: 0,
      totalPrice: 0,
      category: "Sonstige",
    }
    setOfferData({
      ...offerData,
      positions: [...offerData.positions, newPosition],
    })
    setSelectedPosition(newPosition)
    setIsEditing(true)
  }

  const handleUpdatePosition = (updatedPosition: OfferPosition) => {
    updatedPosition.totalPrice = updatedPosition.quantity * updatedPosition.unitPrice
    setOfferData({
      ...offerData,
      positions: offerData.positions.map((pos) => (pos.id === updatedPosition.id ? updatedPosition : pos)),
    })
    calculateTotals()
  }

  const handleDeletePosition = (positionId: string) => {
    setOfferData({
      ...offerData,
      positions: offerData.positions.filter((pos) => pos.id !== positionId),
    })
    if (selectedPosition?.id === positionId) {
      setSelectedPosition(null)
    }
    calculateTotals()
  }

  const calculateTotals = () => {
    const subtotal = offerData.positions.reduce((sum, pos) => sum + pos.totalPrice, 0)
    const riskAmount = (subtotal * offerData.riskPercent) / 100
    const discountAmount = (subtotal * offerData.discountPercent) / 100
    const total = subtotal + riskAmount - discountAmount

    setOfferData({
      ...offerData,
      subtotalLabor: subtotal * 0.7, // Mock split
      subtotalMaterial: subtotal * 0.3,
      total,
    })
  }

  const handleExportPDF = async () => {
    try {
      console.log("[v0] Starting PDF export...")
      const pdfBlob = await PDFGenerator.generateOfferPDF(offerData)
      const filename = `Angebot_${offerData.offerNumber}_${offerData.date}.pdf`
      PDFGenerator.downloadFile(pdfBlob, filename)
      console.log("[v0] PDF export completed")
    } catch (error) {
      console.error("[v0] PDF export failed:", error)
    }
  }

  const handleExportExcel = async () => {
    try {
      console.log("[v0] Starting Excel export...")
      const excelBlob = await PDFGenerator.generateExcelExport(offerData)
      const filename = `Angebot_${offerData.offerNumber}_${offerData.date}.xlsx`
      PDFGenerator.downloadFile(excelBlob, filename)
      console.log("[v0] Excel export completed")
    } catch (error) {
      console.error("[v0] Excel export failed:", error)
    }
  }

  const handleExportGAEB = async () => {
    try {
      console.log("[v0] Starting GAEB export...")
      const gaebBlob = await PDFGenerator.generateGAEBExport(offerData)
      const filename = `Angebot_${offerData.offerNumber}_${offerData.date}.xml`
      PDFGenerator.downloadFile(gaebBlob, filename)
      console.log("[v0] GAEB export completed")
    } catch (error) {
      console.error("[v0] GAEB export failed:", error)
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
                <h1 className="text-2xl font-bold text-foreground mb-2">Angebots-Builder</h1>
                <p className="text-muted-foreground">Angebot erstellen und konfigurieren</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" onClick={handleExportExcel}>
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button variant="outline" onClick={handleExportGAEB}>
                  <Download className="h-4 w-4 mr-2" />
                  GAEB
                </Button>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Versenden
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Editor */}
            <div className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="header">Kopf</TabsTrigger>
                  <TabsTrigger value="positions">Positionen</TabsTrigger>
                  <TabsTrigger value="texts">Texte</TabsTrigger>
                  <TabsTrigger value="summary">Summen</TabsTrigger>
                </TabsList>

                <TabsContent value="header" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Projekt & Kunde
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Angebotsnummer</label>
                          <Input
                            value={offerData.offerNumber}
                            onChange={(e) => setOfferData({ ...offerData, offerNumber: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Datum</label>
                          <Input
                            type="date"
                            value={offerData.date}
                            onChange={(e) => setOfferData({ ...offerData, date: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1 block">Projekttitel</label>
                        <Input
                          value={offerData.projectTitle}
                          onChange={(e) => setOfferData({ ...offerData, projectTitle: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Kunde</label>
                          <Input
                            value={offerData.customer.name}
                            onChange={(e) =>
                              setOfferData({
                                ...offerData,
                                customer: { ...offerData.customer, name: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Ansprechpartner</label>
                          <Input
                            value={offerData.customer.person}
                            onChange={(e) =>
                              setOfferData({
                                ...offerData,
                                customer: { ...offerData.customer, person: e.target.value },
                              })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1 block">Projektadresse</label>
                        <Textarea
                          value={offerData.projectAddress}
                          onChange={(e) => setOfferData({ ...offerData, projectAddress: e.target.value })}
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="positions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Calculator className="h-5 w-5" />
                          Positionen ({offerData.positions.length})
                        </span>
                        <Button size="sm" onClick={handleAddPosition}>
                          <Plus className="h-4 w-4 mr-1" />
                          Position
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-96">
                        <div className="space-y-2">
                          {offerData.positions.map((position) => (
                            <div
                              key={position.id}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedPosition?.id === position.id ? "border-accent bg-accent/5" : "hover:bg-muted/50"
                              }`}
                              onClick={() => setSelectedPosition(position)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline">{position.code || "Neu"}</Badge>
                                    <Badge variant="secondary">{position.category}</Badge>
                                  </div>
                                  <h4 className="font-medium text-sm">{position.title || "Neue Position"}</h4>
                                  <p className="text-xs text-muted-foreground line-clamp-1">{position.description}</p>
                                  <div className="flex items-center gap-4 mt-2 text-xs">
                                    <span>
                                      {position.quantity} {position.unit}
                                    </span>
                                    <span>€{position.unitPrice.toFixed(2)}</span>
                                    <span className="font-medium">€{position.totalPrice.toFixed(2)}</span>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeletePosition(position.id)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {selectedPosition && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Position bearbeiten</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Code</label>
                            <Input
                              value={selectedPosition.code}
                              onChange={(e) => setSelectedPosition({ ...selectedPosition, code: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Kategorie</label>
                            <Select
                              value={selectedPosition.category}
                              onValueChange={(value) => setSelectedPosition({ ...selectedPosition, category: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Gerüstarbeiten">Gerüstarbeiten</SelectItem>
                                <SelectItem value="Vorarbeiten">Vorarbeiten</SelectItem>
                                <SelectItem value="Dämmarbeiten">Dämmarbeiten</SelectItem>
                                <SelectItem value="Putzarbeiten">Putzarbeiten</SelectItem>
                                <SelectItem value="Malerarbeiten">Malerarbeiten</SelectItem>
                                <SelectItem value="Sonstige">Sonstige</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-1 block">Titel</label>
                          <Input
                            value={selectedPosition.title}
                            onChange={(e) => setSelectedPosition({ ...selectedPosition, title: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-1 block">Beschreibung</label>
                          <Textarea
                            value={selectedPosition.description}
                            onChange={(e) => setSelectedPosition({ ...selectedPosition, description: e.target.value })}
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Menge</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={selectedPosition.quantity}
                              onChange={(e) =>
                                setSelectedPosition({
                                  ...selectedPosition,
                                  quantity: Number.parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Einheit</label>
                            <Select
                              value={selectedPosition.unit}
                              onValueChange={(value) => setSelectedPosition({ ...selectedPosition, unit: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="m²">m²</SelectItem>
                                <SelectItem value="m³">m³</SelectItem>
                                <SelectItem value="m">m</SelectItem>
                                <SelectItem value="Stk">Stk</SelectItem>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="h">h</SelectItem>
                                <SelectItem value="pauschal">pauschal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Einheitspreis (€)</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={selectedPosition.unitPrice}
                              onChange={(e) =>
                                setSelectedPosition({
                                  ...selectedPosition,
                                  unitPrice: Number.parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Gesamtpreis (€)</label>
                            <Input
                              value={(selectedPosition.quantity * selectedPosition.unitPrice).toFixed(2)}
                              readOnly
                              className="bg-muted"
                            />
                          </div>
                        </div>

                        <Button onClick={() => handleUpdatePosition(selectedPosition)} className="w-full">
                          <Save className="h-4 w-4 mr-2" />
                          Position speichern
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="texts" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Textbausteine</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Einleitung</label>
                        <Textarea
                          value={offerData.textBlocks.introduction}
                          onChange={(e) =>
                            setOfferData({
                              ...offerData,
                              textBlocks: { ...offerData.textBlocks, introduction: e.target.value },
                            })
                          }
                          rows={4}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1 block">Unsere Vorteile</label>
                        <Textarea
                          value={offerData.textBlocks.advantages}
                          onChange={(e) =>
                            setOfferData({
                              ...offerData,
                              textBlocks: { ...offerData.textBlocks, advantages: e.target.value },
                            })
                          }
                          rows={4}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1 block">Projektablauf</label>
                        <Textarea
                          value={offerData.textBlocks.process}
                          onChange={(e) =>
                            setOfferData({
                              ...offerData,
                              textBlocks: { ...offerData.textBlocks, process: e.target.value },
                            })
                          }
                          rows={4}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1 block">Bedingungen</label>
                        <Textarea
                          value={offerData.textBlocks.terms}
                          onChange={(e) =>
                            setOfferData({
                              ...offerData,
                              textBlocks: { ...offerData.textBlocks, terms: e.target.value },
                            })
                          }
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="summary" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Euro className="h-5 w-5" />
                        Preiskalkulation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Risiko (%)</label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.1"
                              value={offerData.riskPercent}
                              onChange={(e) =>
                                setOfferData({
                                  ...offerData,
                                  riskPercent: Number.parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                            <Percent className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Rabatt (%)</label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.1"
                              value={offerData.discountPercent}
                              onChange={(e) =>
                                setOfferData({
                                  ...offerData,
                                  discountPercent: Number.parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                            <Percent className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Zwischensumme Positionen:</span>
                          <span>€{offerData.positions.reduce((sum, pos) => sum + pos.totalPrice, 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>davon Lohnkosten (70%):</span>
                          <span>€{offerData.subtotalLabor.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>davon Materialkosten (30%):</span>
                          <span>€{offerData.subtotalMaterial.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Risikozuschlag ({offerData.riskPercent}%):</span>
                          <span>
                            €
                            {(
                              (offerData.positions.reduce((sum, pos) => sum + pos.totalPrice, 0) *
                                offerData.riskPercent) /
                              100
                            ).toFixed(2)}
                          </span>
                        </div>
                        {offerData.discountPercent > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Rabatt ({offerData.discountPercent}%):</span>
                            <span>
                              -€
                              {(
                                (offerData.positions.reduce((sum, pos) => sum + pos.totalPrice, 0) *
                                  offerData.discountPercent) /
                                100
                              ).toFixed(2)}
                            </span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Gesamtsumme:</span>
                          <span>€{offerData.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>zzgl. 19% MwSt.:</span>
                          <span>€{(offerData.total * 0.19).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-accent">
                          <span>Endsumme inkl. MwSt.:</span>
                          <span>€{(offerData.total * 1.19).toFixed(2)}</span>
                        </div>
                      </div>

                      <Button onClick={calculateTotals} variant="outline" className="w-full bg-transparent">
                        <Calculator className="h-4 w-4 mr-2" />
                        Summen neu berechnen
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Panel - Live Preview */}
            <div className="lg:sticky lg:top-6">
              <Card className="h-[800px]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Live-Vorschau
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-full">
                  <ScrollArea className="h-full">
                    <div className="space-y-6 text-sm">
                      {/* Header */}
                      <div className="text-center border-b pb-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Building2 className="h-6 w-6 text-accent" />
                          <span className="text-lg font-bold">Handwerk GmbH</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Musterstraße 1 • 12345 Musterstadt • Tel: 01234/56789
                        </p>
                      </div>

                      {/* Offer Header */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h2 className="text-lg font-bold mb-2">ANGEBOT</h2>
                          <div className="space-y-1 text-xs">
                            <div>
                              <strong>Angebots-Nr.:</strong> {offerData.offerNumber}
                            </div>
                            <div>
                              <strong>Datum:</strong> {offerData.date}
                            </div>
                            <div>
                              <strong>Gültig bis:</strong> {offerData.validUntil}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs">
                            <div className="font-medium">{offerData.customer.name}</div>
                            <div>{offerData.customer.person}</div>
                            <div className="whitespace-pre-line">{offerData.customer.address}</div>
                          </div>
                        </div>
                      </div>

                      {/* Project Title */}
                      <div>
                        <h3 className="font-bold text-base mb-2">{offerData.projectTitle}</h3>
                        <p className="text-xs text-muted-foreground">Projektadresse: {offerData.projectAddress}</p>
                      </div>

                      {/* Introduction */}
                      <div className="whitespace-pre-line text-xs">{offerData.textBlocks.introduction}</div>

                      {/* Positions Table */}
                      <div>
                        <h4 className="font-medium mb-2">Leistungsverzeichnis</h4>
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full text-xs">
                            <thead className="bg-muted">
                              <tr>
                                <th className="text-left p-2 border-r">Pos.</th>
                                <th className="text-left p-2 border-r">Beschreibung</th>
                                <th className="text-right p-2 border-r">Menge</th>
                                <th className="text-right p-2 border-r">EP</th>
                                <th className="text-right p-2">GP</th>
                              </tr>
                            </thead>
                            <tbody>
                              {offerData.positions.map((position, index) => (
                                <tr key={position.id} className="border-t">
                                  <td className="p-2 border-r">{position.code || index + 1}</td>
                                  <td className="p-2 border-r">
                                    <div className="font-medium">{position.title}</div>
                                    <div className="text-muted-foreground">{position.description}</div>
                                  </td>
                                  <td className="text-right p-2 border-r">
                                    {position.quantity} {position.unit}
                                  </td>
                                  <td className="text-right p-2 border-r">€{position.unitPrice.toFixed(2)}</td>
                                  <td className="text-right p-2 font-medium">€{position.totalPrice.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="border-t pt-4">
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Zwischensumme:</span>
                            <span>€{offerData.positions.reduce((sum, pos) => sum + pos.totalPrice, 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Risikozuschlag ({offerData.riskPercent}%):</span>
                            <span>
                              €
                              {(
                                (offerData.positions.reduce((sum, pos) => sum + pos.totalPrice, 0) *
                                  offerData.riskPercent) /
                                100
                              ).toFixed(2)}
                            </span>
                          </div>
                          {offerData.discountPercent > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Rabatt ({offerData.discountPercent}%):</span>
                              <span>
                                -€
                                {(
                                  (offerData.positions.reduce((sum, pos) => sum + pos.totalPrice, 0) *
                                    offerData.discountPercent) /
                                  100
                                ).toFixed(2)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold border-t pt-1">
                            <span>Nettosumme:</span>
                            <span>€{offerData.total.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>zzgl. 19% MwSt.:</span>
                            <span>€{(offerData.total * 0.19).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-accent border-t pt-1">
                            <span>Gesamtsumme:</span>
                            <span>€{(offerData.total * 1.19).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Additional Text Blocks */}
                      <div className="space-y-4">
                        <div className="whitespace-pre-line text-xs">{offerData.textBlocks.advantages}</div>
                        <div className="whitespace-pre-line text-xs">{offerData.textBlocks.process}</div>
                        <div className="whitespace-pre-line text-xs">{offerData.textBlocks.terms}</div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
