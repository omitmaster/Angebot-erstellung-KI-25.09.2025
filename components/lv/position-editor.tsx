"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, X, Calculator, AlertCircle } from "lucide-react"
import type { LVPosition } from "@/lib/lv-parser"

interface PositionEditorProps {
  position: LVPosition
  onSave: (position: LVPosition) => void
  onCancel: () => void
  pricebookItems?: any[]
}

export function PositionEditor({ position, onSave, onCancel, pricebookItems = [] }: PositionEditorProps) {
  const [editedPosition, setEditedPosition] = useState<LVPosition>({ ...position })
  const [isCalculating, setIsCalculating] = useState(false)

  const handleSave = () => {
    // Calculate total price if both quantity and unit price are available
    if (editedPosition.quantity && editedPosition.unitPrice) {
      editedPosition.totalPrice = editedPosition.quantity * editedPosition.unitPrice
    }

    onSave(editedPosition)
  }

  const handleAutoCalculate = async () => {
    setIsCalculating(true)

    // Simulate price calculation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock calculation based on category
    let estimatedPrice = 0
    switch (editedPosition.category) {
      case "Gerüstarbeiten":
        estimatedPrice = 8.5
        break
      case "Dämmarbeiten":
        estimatedPrice = 45.0
        break
      case "Putzarbeiten":
        estimatedPrice = 15.0
        break
      default:
        estimatedPrice = 25.0
    }

    setEditedPosition({
      ...editedPosition,
      unitPrice: estimatedPrice,
      totalPrice: editedPosition.quantity ? editedPosition.quantity * estimatedPrice : undefined,
      status: editedPosition.status === "unclear" ? "assumption" : editedPosition.status,
      comments: editedPosition.comments
        ? `${editedPosition.comments}\nPreis automatisch kalkuliert`
        : "Preis automatisch kalkuliert",
    })

    setIsCalculating(false)
  }

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

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Position bearbeiten
          <Button size="sm" variant="ghost" onClick={onCancel}>
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
            <Select
              value={editedPosition.status}
              onValueChange={(value: "clear" | "assumption" | "unclear") =>
                setEditedPosition({ ...editedPosition, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clear">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Klar
                  </div>
                </SelectItem>
                <SelectItem value="assumption">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Annahme
                  </div>
                </SelectItem>
                <SelectItem value="unclear">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Unklar
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
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

        <div>
          <label className="text-sm font-medium mb-1 block">Kategorie</label>
          <Select
            value={editedPosition.category}
            onValueChange={(value) => setEditedPosition({ ...editedPosition, category: value })}
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
              <SelectItem value="Bodenarbeiten">Bodenarbeiten</SelectItem>
              <SelectItem value="Elektroarbeiten">Elektroarbeiten</SelectItem>
              <SelectItem value="Sanitärarbeiten">Sanitärarbeiten</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Menge</label>
            <Input
              type="number"
              step="0.01"
              value={editedPosition.quantity || ""}
              onChange={(e) =>
                setEditedPosition({
                  ...editedPosition,
                  quantity: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Einheit</label>
            <Select
              value={editedPosition.unit}
              onValueChange={(value) => setEditedPosition({ ...editedPosition, unit: value })}
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
                <SelectItem value="t">t</SelectItem>
                <SelectItem value="h">h</SelectItem>
                <SelectItem value="pauschal">pauschal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Einheitspreis (€)</label>
            <div className="flex gap-1">
              <Input
                type="number"
                step="0.01"
                value={editedPosition.unitPrice || ""}
                onChange={(e) =>
                  setEditedPosition({
                    ...editedPosition,
                    unitPrice: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                  })
                }
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleAutoCalculate}
                disabled={isCalculating}
                title="Preis automatisch kalkulieren"
              >
                <Calculator className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Gesamtpreis (€)</label>
            <Input
              type="number"
              step="0.01"
              value={editedPosition.totalPrice || ""}
              onChange={(e) =>
                setEditedPosition({
                  ...editedPosition,
                  totalPrice: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                })
              }
              className="bg-muted"
              readOnly
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Kommentare</label>
          <Textarea
            value={editedPosition.comments || ""}
            onChange={(e) => setEditedPosition({ ...editedPosition, comments: e.target.value })}
            rows={2}
            placeholder="Zusätzliche Anmerkungen oder Annahmen..."
          />
        </div>

        {editedPosition.status !== "clear" && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Offene Punkte</span>
            </div>
            <div className="space-y-1">
              {editedPosition.questions?.map((question, index) => (
                <p key={index} className="text-sm text-yellow-700">
                  • {question}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Speichern
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
            Abbrechen
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
