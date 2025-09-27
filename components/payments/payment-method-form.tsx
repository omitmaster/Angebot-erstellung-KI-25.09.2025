"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Banknote } from "lucide-react"

interface PaymentMethodFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function PaymentMethodForm({ open, onOpenChange, onSuccess }: PaymentMethodFormProps) {
  const [formData, setFormData] = useState({
    type: "credit_card",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    holderName: "",
    isDefault: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Nicht angemeldet")

      // In a real implementation, you would tokenize the card with Stripe
      // For demo purposes, we'll simulate this
      const lastFour = formData.cardNumber.slice(-4)
      const brand = getBrandFromCardNumber(formData.cardNumber)

      const paymentMethodData = {
        user_id: user.id,
        type: formData.type,
        provider: "stripe",
        provider_payment_method_id: `pm_${Math.random().toString(36).substr(2, 9)}`, // Simulated
        last_four: lastFour,
        brand: brand,
        expires_month: Number.parseInt(formData.expiryMonth),
        expires_year: Number.parseInt(formData.expiryYear),
        is_default: formData.isDefault,
      }

      // If this is set as default, unset other defaults first
      if (formData.isDefault) {
        await supabase.from("payment_methods").update({ is_default: false }).eq("user_id", user.id)
      }

      const { error } = await supabase.from("payment_methods").insert([paymentMethodData])

      if (error) throw error

      // Reset form
      setFormData({
        type: "credit_card",
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
        holderName: "",
        isDefault: false,
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ein Fehler ist aufgetreten")
    } finally {
      setIsLoading(false)
    }
  }

  const getBrandFromCardNumber = (cardNumber: string): string => {
    const number = cardNumber.replace(/\s/g, "")
    if (number.startsWith("4")) return "visa"
    if (number.startsWith("5") || number.startsWith("2")) return "mastercard"
    if (number.startsWith("3")) return "amex"
    return "unknown"
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setFormData({ ...formData, cardNumber: formatted })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Zahlungsmethode hinzufügen</DialogTitle>
          <DialogDescription>Fügen Sie eine neue Zahlungsmethode zu Ihrem Konto hinzu</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Type */}
          <div>
            <Label>Zahlungsart</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Kreditkarte
                  </div>
                </SelectItem>
                <SelectItem value="debit_card">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    Debitkarte
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Card Holder Name */}
          <div>
            <Label htmlFor="holderName">Karteninhaber *</Label>
            <Input
              id="holderName"
              value={formData.holderName}
              onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
              placeholder="Max Mustermann"
              required
            />
          </div>

          {/* Card Number */}
          <div>
            <Label htmlFor="cardNumber">Kartennummer *</Label>
            <Input
              id="cardNumber"
              value={formData.cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
            />
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="expiryMonth">Monat *</Label>
              <Select
                value={formData.expiryMonth}
                onValueChange={(value) => setFormData({ ...formData, expiryMonth: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={month.toString().padStart(2, "0")}>
                      {month.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expiryYear">Jahr *</Label>
              <Select
                value={formData.expiryYear}
                onValueChange={(value) => setFormData({ ...formData, expiryYear: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="YYYY" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cvv">CVV *</Label>
              <Input
                id="cvv"
                value={formData.cvv}
                onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, "") })}
                placeholder="123"
                maxLength={4}
                required
              />
            </div>
          </div>

          {/* Default Payment Method */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isDefault" className="text-sm">
              Als Standard-Zahlungsmethode festlegen
            </Label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Wird hinzugefügt..." : "Hinzufügen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
