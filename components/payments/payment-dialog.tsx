"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CreditCard, Euro } from "lucide-react"

interface PaymentMethod {
  id: string
  type: string
  brand: string
  last_four: string
  is_default: boolean
}

interface PaymentDialogProps {
  jobId: string
  payeeId: string
  payeeName: string
  suggestedAmount?: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function PaymentDialog({
  jobId,
  payeeId,
  payeeName,
  suggestedAmount = 0,
  open,
  onOpenChange,
  onSuccess,
}: PaymentDialogProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [formData, setFormData] = useState({
    amount: suggestedAmount.toString(),
    paymentMethodId: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchPaymentMethods()
      setFormData({
        amount: suggestedAmount.toString(),
        paymentMethodId: "",
        description: "",
      })
    }
  }, [open, suggestedAmount])

  const fetchPaymentMethods = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("payment_methods")
        .select("id, type, brand, last_four, is_default")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("is_default", { ascending: false })

      if (error) throw error

      setPaymentMethods(data || [])

      // Auto-select default payment method
      const defaultMethod = data?.find((method) => method.is_default)
      if (defaultMethod) {
        setFormData((prev) => ({ ...prev, paymentMethodId: defaultMethod.id }))
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.paymentMethodId) {
      setError("Bitte wählen Sie eine Zahlungsmethode aus")
      return
    }

    const amount = Number.parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError("Bitte geben Sie einen gültigen Betrag ein")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Nicht angemeldet")

      // Call the process_payment function
      const { data, error } = await supabase.rpc("process_payment", {
        p_job_id: jobId,
        p_payer_id: user.id,
        p_payee_id: payeeId,
        p_amount_cents: Math.round(amount * 100),
        p_payment_method_id: formData.paymentMethodId,
        p_description: formData.description || `Zahlung für Auftrag an ${payeeName}`,
      })

      if (error) throw error

      // In a real implementation, you would integrate with Stripe or another payment processor here
      // For demo purposes, we'll simulate a successful payment
      setTimeout(async () => {
        // Update payment status to completed (simulating successful payment processing)
        await supabase
          .from("payments")
          .update({
            status: "completed",
            paid_at: new Date().toISOString(),
            provider_payment_id: `pi_${Math.random().toString(36).substr(2, 9)}`,
          })
          .eq("id", data)

        onOpenChange(false)
        onSuccess?.()
      }, 2000)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ein Fehler ist aufgetreten")
      setIsLoading(false)
    }
  }

  const getBrandName = (brand: string) => {
    const brands: { [key: string]: string } = {
      visa: "Visa",
      mastercard: "Mastercard",
      amex: "American Express",
      unknown: "Karte",
    }
    return brands[brand] || "Karte"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Zahlung senden</DialogTitle>
          <DialogDescription>Senden Sie eine Zahlung an {payeeName}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <Label htmlFor="amount">Betrag (EUR) *</Label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <Label>Zahlungsmethode *</Label>
            {paymentMethods.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Keine Zahlungsmethoden verfügbar</p>
                <p className="text-xs">Fügen Sie zuerst eine Zahlungsmethode hinzu</p>
              </div>
            ) : (
              <Select
                value={formData.paymentMethodId}
                onValueChange={(value) => setFormData({ ...formData, paymentMethodId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Zahlungsmethode auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        {getBrandName(method.brand)} •••• {method.last_four}
                        {method.is_default && <span className="text-xs text-muted-foreground">(Standard)</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Beschreibung (optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Wofür ist diese Zahlung?"
              rows={3}
              maxLength={500}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading || paymentMethods.length === 0} className="flex-1">
              {isLoading ? "Wird verarbeitet..." : `${formData.amount} € senden`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
