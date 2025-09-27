"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Package,
  Plus,
  Search,
  ShoppingCart,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
} from "lucide-react"

interface Material {
  id: string
  name: string
  category: string
  unit: string
  currentStock: number
  minStock: number
  maxStock: number
  unitPrice: number
  supplier: string
  supplierContact: string
  lastOrderDate?: string
  status: "in_stock" | "low_stock" | "out_of_stock" | "ordered"
  description: string
}

interface MaterialOrder {
  id: string
  orderNumber: string
  supplier: string
  items: Array<{
    materialId: string
    materialName: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  totalAmount: number
  status: "draft" | "sent" | "confirmed" | "delivered" | "cancelled"
  orderDate: string
  expectedDelivery?: string
  notes: string
}

const mockMaterials: Material[] = [
  {
    id: "1",
    name: "EPS Dämmplatten 14cm",
    category: "Dämmung",
    unit: "m²",
    currentStock: 45,
    minStock: 20,
    maxStock: 200,
    unitPrice: 12.5,
    supplier: "Dämmstoff GmbH",
    supplierContact: "+49 40 123456",
    lastOrderDate: "2024-01-15",
    status: "low_stock",
    description: "EPS Dämmplatten 1000x500x140mm, WLS 032",
  },
  {
    id: "2",
    name: "Armierungsmörtel",
    category: "Putz",
    unit: "Sack",
    currentStock: 8,
    minStock: 10,
    maxStock: 50,
    unitPrice: 18.9,
    supplier: "Baustoffe Nord",
    supplierContact: "+49 40 987654",
    status: "low_stock",
    description: "Armierungsmörtel 25kg, für WDVS",
  },
  {
    id: "3",
    name: "Glasfasergewebe",
    category: "Armierung",
    unit: "m²",
    currentStock: 120,
    minStock: 50,
    maxStock: 300,
    unitPrice: 2.8,
    supplier: "Fassaden-Profi",
    supplierContact: "+49 40 555777",
    lastOrderDate: "2024-01-10",
    status: "in_stock",
    description: "Glasfasergewebe 165g/m², alkalibeständig",
  },
  {
    id: "4",
    name: "Oberputz mineralisch",
    category: "Putz",
    unit: "Sack",
    currentStock: 0,
    minStock: 5,
    maxStock: 30,
    unitPrice: 22.5,
    supplier: "Baustoffe Nord",
    supplierContact: "+49 40 987654",
    status: "out_of_stock",
    description: "Mineralischer Oberputz 25kg, Körnung 2mm",
  },
]

const mockOrders: MaterialOrder[] = [
  {
    id: "1",
    orderNumber: "MAT-2024-001",
    supplier: "Dämmstoff GmbH",
    items: [
      {
        materialId: "1",
        materialName: "EPS Dämmplatten 14cm",
        quantity: 100,
        unitPrice: 12.5,
        totalPrice: 1250.0,
      },
    ],
    totalAmount: 1250.0,
    status: "sent",
    orderDate: "2024-01-20",
    expectedDelivery: "2024-01-25",
    notes: "Dringend für Projekt Müller",
  },
  {
    id: "2",
    orderNumber: "MAT-2024-002",
    supplier: "Baustoffe Nord",
    items: [
      {
        materialId: "2",
        materialName: "Armierungsmörtel",
        quantity: 20,
        unitPrice: 18.9,
        totalPrice: 378.0,
      },
      {
        materialId: "4",
        materialName: "Oberputz mineralisch",
        quantity: 15,
        unitPrice: 22.5,
        totalPrice: 337.5,
      },
    ],
    totalAmount: 715.5,
    status: "draft",
    orderDate: "2024-01-22",
    notes: "Sammelbestellung für mehrere Projekte",
  },
]

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>(mockMaterials)
  const [orders, setOrders] = useState<MaterialOrder[]>(mockOrders)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<MaterialOrder | null>(null)
  const [activeTab, setActiveTab] = useState("inventory")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-green-100 text-green-800 border-green-200"
      case "low_stock":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "out_of_stock":
        return "bg-red-100 text-red-800 border-red-200"
      case "ordered":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_stock":
        return <CheckCircle className="h-4 w-4" />
      case "low_stock":
        return <AlertTriangle className="h-4 w-4" />
      case "out_of_stock":
        return <AlertTriangle className="h-4 w-4" />
      case "ordered":
        return <Clock className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "in_stock":
        return "Verfügbar"
      case "low_stock":
        return "Niedrig"
      case "out_of_stock":
        return "Nicht verfügbar"
      case "ordered":
        return "Bestellt"
      default:
        return status
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "sent":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200"
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredMaterials = materials.filter((material) => {
    const categoryMatch = filterCategory === "all" || material.category === filterCategory
    const statusMatch = filterStatus === "all" || material.status === filterStatus
    const searchMatch =
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase())
    return categoryMatch && statusMatch && searchMatch
  })

  const lowStockMaterials = materials.filter((m) => m.status === "low_stock" || m.status === "out_of_stock")

  const handleCreateOrder = (materialIds: string[]) => {
    console.log("[v0] Creating order for materials:", materialIds)

    const selectedMaterials = materials.filter((m) => materialIds.includes(m.id))
    const orderItems = selectedMaterials.map((material) => ({
      materialId: material.id,
      materialName: material.name,
      quantity: Math.max(material.minStock - material.currentStock, 1),
      unitPrice: material.unitPrice,
      totalPrice: material.unitPrice * Math.max(material.minStock - material.currentStock, 1),
    }))

    const newOrder: MaterialOrder = {
      id: Date.now().toString(),
      orderNumber: `MAT-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, "0")}`,
      supplier: selectedMaterials[0]?.supplier || "Unbekannt",
      items: orderItems,
      totalAmount: orderItems.reduce((sum, item) => sum + item.totalPrice, 0),
      status: "draft",
      orderDate: new Date().toISOString().split("T")[0],
      notes: "Automatisch erstellt für niedrige Bestände",
    }

    setOrders([...orders, newOrder])
    setSelectedOrder(newOrder)
    setActiveTab("orders")
  }

  const handleSendOrder = async (orderId: string) => {
    console.log("[v0] Sending order:", orderId)

    const order = orders.find((o) => o.id === orderId)
    if (!order) return

    const orderDetails = `Bestellung ${order.orderNumber}:\n\n${order.items
      .map(
        (item) =>
          `• ${item.materialName}: ${item.quantity} ${materials.find((m) => m.id === item.materialId)?.unit || "Stk"}`,
      )
      .join("\n")}\n\nGesamtsumme: €${order.totalAmount.toFixed(2)}\n\nBitte bestätigen Sie die Verfügbarkeit.`

    console.log("[v0] Order details:", orderDetails)

    // Update order status
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: "sent" as const } : o)))
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
                <h1 className="text-2xl font-bold text-foreground mb-2">Materialverwaltung</h1>
                <p className="text-muted-foreground">Lagerbestand verwalten und Bestellungen automatisieren</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Kommunikation
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Material hinzufügen
                </Button>
              </div>
            </div>
          </div>

          {/* Alert for low stock */}
          {lowStockMaterials.length > 0 && (
            <Card className="mb-6 border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">
                      {lowStockMaterials.length} Material{lowStockMaterials.length !== 1 ? "ien" : ""} mit niedrigem
                      Bestand
                    </span>
                  </div>
                  <Button size="sm" onClick={() => handleCreateOrder(lowStockMaterials.map((m) => m.id))}>
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Bestellung erstellen
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="inventory">Lagerbestand</TabsTrigger>
              <TabsTrigger value="orders">Bestellungen</TabsTrigger>
              <TabsTrigger value="suppliers">Lieferanten</TabsTrigger>
            </TabsList>

            <TabsContent value="inventory" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel - Materials List */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Materialien ({filteredMaterials.length})</span>
                        <div className="flex gap-2">
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Suchen..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-8 w-40"
                            />
                          </div>
                          <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Kategorie" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Alle</SelectItem>
                              <SelectItem value="Dämmung">Dämmung</SelectItem>
                              <SelectItem value="Putz">Putz</SelectItem>
                              <SelectItem value="Armierung">Armierung</SelectItem>
                              <SelectItem value="Farbe">Farbe</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Alle</SelectItem>
                              <SelectItem value="in_stock">Verfügbar</SelectItem>
                              <SelectItem value="low_stock">Niedrig</SelectItem>
                              <SelectItem value="out_of_stock">Nicht verfügbar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[600px]">
                        <div className="space-y-3">
                          {filteredMaterials.map((material) => (
                            <div
                              key={material.id}
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                selectedMaterial?.id === material.id ? "border-accent bg-accent/5" : "hover:bg-muted/50"
                              }`}
                              onClick={() => setSelectedMaterial(material)}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline">{material.category}</Badge>
                                    <Badge className={getStatusColor(material.status)}>
                                      <span className="flex items-center gap-1">
                                        {getStatusIcon(material.status)}
                                        {getStatusLabel(material.status)}
                                      </span>
                                    </Badge>
                                  </div>
                                  <h4 className="font-medium text-sm">{material.name}</h4>
                                  <p className="text-xs text-muted-foreground mb-2">{material.description}</p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>
                                      Bestand: {material.currentStock} {material.unit}
                                    </span>
                                    <span>Min: {material.minStock}</span>
                                    <span>
                                      €{material.unitPrice.toFixed(2)}/{material.unit}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    material.currentStock <= material.minStock
                                      ? "bg-red-500"
                                      : material.currentStock <= material.minStock * 1.5
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                  }`}
                                  style={{
                                    width: `${Math.min((material.currentStock / material.maxStock) * 100, 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Panel - Material Details */}
                <div className="space-y-6">
                  {selectedMaterial ? (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Materialdetails
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Name</label>
                            <p className="text-sm font-medium">{selectedMaterial.name}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Beschreibung</label>
                            <p className="text-sm">{selectedMaterial.description}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Kategorie</label>
                              <p className="text-sm">{selectedMaterial.category}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Einheit</label>
                              <p className="text-sm">{selectedMaterial.unit}</p>
                            </div>
                          </div>

                          <Separator />

                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Aktuell</label>
                              <p className="text-sm font-medium">{selectedMaterial.currentStock}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Min</label>
                              <p className="text-sm">{selectedMaterial.minStock}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Max</label>
                              <p className="text-sm">{selectedMaterial.maxStock}</p>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-medium text-muted-foreground">
                              Preis pro {selectedMaterial.unit}
                            </label>
                            <p className="text-sm font-medium">€{selectedMaterial.unitPrice.toFixed(2)}</p>
                          </div>

                          <Separator />

                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Lieferant</label>
                            <p className="text-sm">{selectedMaterial.supplier}</p>
                            <p className="text-xs text-muted-foreground">{selectedMaterial.supplierContact}</p>
                          </div>

                          {selectedMaterial.lastOrderDate && (
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Letzte Bestellung</label>
                              <p className="text-sm">{selectedMaterial.lastOrderDate}</p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                              <Edit className="h-4 w-4 mr-1" />
                              Bearbeiten
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleCreateOrder([selectedMaterial.id])}
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Bestellen
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <Card>
                      <CardContent className="flex items-center justify-center h-64">
                        <div className="text-center">
                          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">Wählen Sie ein Material aus der Liste</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel - Orders List */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Bestellungen ({orders.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[600px]">
                        <div className="space-y-3">
                          {orders.map((order) => (
                            <div
                              key={order.id}
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                selectedOrder?.id === order.id ? "border-accent bg-accent/5" : "hover:bg-muted/50"
                              }`}
                              onClick={() => setSelectedOrder(order)}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline">{order.orderNumber}</Badge>
                                    <Badge className={getOrderStatusColor(order.status)}>
                                      {order.status === "draft"
                                        ? "Entwurf"
                                        : order.status === "sent"
                                          ? "Versendet"
                                          : order.status === "confirmed"
                                            ? "Bestätigt"
                                            : order.status === "delivered"
                                              ? "Geliefert"
                                              : "Storniert"}
                                    </Badge>
                                    {order.status === "sent" && (
                                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                                        <MessageSquare className="h-3 w-3 mr-1" />
                                        Versendet
                                      </Badge>
                                    )}
                                  </div>
                                  <h4 className="font-medium text-sm">{order.supplier}</h4>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    {order.items.length} Position{order.items.length !== 1 ? "en" : ""}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>€{order.totalAmount.toFixed(2)}</span>
                                    <span>Bestellt: {order.orderDate}</span>
                                    {order.expectedDelivery && (
                                      <span className="text-blue-600">Lieferung: {order.expectedDelivery}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {order.notes && (
                                <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded mt-2">
                                  {order.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Panel - Order Details */}
                <div className="space-y-6">
                  {selectedOrder ? (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Bestelldetails
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Bestellnummer</label>
                            <p className="text-sm font-medium">{selectedOrder.orderNumber}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Lieferant</label>
                            <p className="text-sm">{selectedOrder.supplier}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Bestelldatum</label>
                              <p className="text-sm">{selectedOrder.orderDate}</p>
                            </div>
                            {selectedOrder.expectedDelivery && (
                              <div>
                                <label className="text-xs font-medium text-muted-foreground">Lieferung</label>
                                <p className="text-sm">{selectedOrder.expectedDelivery}</p>
                              </div>
                            )}
                          </div>

                          <Separator />

                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Positionen</label>
                            <div className="space-y-2">
                              {selectedOrder.items.map((item, index) => (
                                <div key={index} className="bg-muted/50 p-2 rounded text-xs">
                                  <div className="font-medium">{item.materialName}</div>
                                  <div className="flex justify-between text-muted-foreground">
                                    <span>
                                      {item.quantity} × €{item.unitPrice.toFixed(2)}
                                    </span>
                                    <span>€{item.totalPrice.toFixed(2)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-between font-medium">
                            <span>Gesamtsumme:</span>
                            <span>€{selectedOrder.totalAmount.toFixed(2)}</span>
                          </div>

                          {selectedOrder.notes && (
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Notizen</label>
                              <p className="text-xs bg-muted/50 p-2 rounded mt-1">{selectedOrder.notes}</p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            {selectedOrder.status === "draft" && (
                              <Button size="sm" className="flex-1" onClick={() => handleSendOrder(selectedOrder.id)}>
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Senden
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                              <Edit className="h-4 w-4 mr-1" />
                              Bearbeiten
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <Card>
                      <CardContent className="flex items-center justify-center h-64">
                        <div className="text-center">
                          <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">Wählen Sie eine Bestellung aus der Liste</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="suppliers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lieferanten</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from(new Set(materials.map((m) => m.supplier))).map((supplier) => {
                      const supplierMaterials = materials.filter((m) => m.supplier === supplier)
                      const contact = supplierMaterials[0]?.supplierContact

                      return (
                        <Card key={supplier}>
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">{supplier}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{contact}</p>
                            <div className="text-xs text-muted-foreground">
                              {supplierMaterials.length} Material{supplierMaterials.length !== 1 ? "ien" : ""}
                            </div>
                            <Button size="sm" variant="outline" className="w-full mt-3 bg-transparent">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Kontaktieren
                            </Button>
                          </CardContent>
                        </Card>
                      )
                    })}
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
