"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PaymentMethodForm } from "./payment-method-form"
import { CreditCard, Trash2, Star } from "lucide-react"

interface PaymentMethod {
  id: string
  type: string
  brand: string
  last_four: string
  expires_month: number
  expires_year: number
  is_default: boolean
  created_at: string
}

export function PaymentMethodsList() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false })

      if (error) throw error
      setPaymentMethods(data || [])
    } catch (error) {
      console.error("Error fetching payment methods:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Unset all defaults first
      await supabase.from("payment_methods").update({ is_default: false }).eq("user_id", user.id)

      // Set new default
      await supabase.from("payment_methods").update({ is_default: true }).eq("id", paymentMethodId)

      fetchPaymentMethods()
    } catch (error) {
      console.error("Error setting default payment method:", error)
    }
  }

  const handleDelete = async (paymentMethodId: string) => {
    if (!confirm("Sind Sie sicher, dass Sie diese Zahlungsmethode löschen möchten?")) return

    try {
      await supabase.from("payment_methods").update({ is_active: false }).eq("id", paymentMethodId)

      fetchPaymentMethods()
    } catch (error) {
      console.error("Error deleting payment method:", error)
    }
  }

  const getBrandIcon = (brand: string) => {
    return <CreditCard className="h-5 w-5" />
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Zahlungsmethoden</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
                  </div>
                </div>
                <div className="w-20 h-8 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Zahlungsmethoden</CardTitle>
          <Button onClick={() => setShowAddForm(true)}>Hinzufügen</Button>
        </CardHeader>
        <CardContent>
          {paymentMethods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Zahlungsmethoden vorhanden</p>
              <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setShowAddForm(true)}>
                Erste Zahlungsmethode hinzufügen
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getBrandIcon(method.brand)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {getBrandName(method.brand)} •••• {method.last_four}
                        </span>
                        {method.is_default && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Standard
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Läuft ab {method.expires_month.toString().padStart(2, "0")}/{method.expires_year}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.is_default && (
                      <Button variant="outline" size="sm" onClick={() => handleSetDefault(method.id)}>
                        Als Standard
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleDelete(method.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PaymentMethodForm open={showAddForm} onOpenChange={setShowAddForm} onSuccess={fetchPaymentMethods} />
    </>
  )
}
