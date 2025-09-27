"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Hammer } from "lucide-react"

const tradeCategories = [
  { value: "elektriker", label: "Elektriker" },
  { value: "klempner", label: "Klempner/Sanitär" },
  { value: "zimmermann", label: "Zimmermann" },
  { value: "maler", label: "Maler/Lackierer" },
  { value: "fliesenleger", label: "Fliesenleger" },
  { value: "heizung", label: "Heizung/Klima" },
  { value: "dachdecker", label: "Dachdecker" },
  { value: "gartenbau", label: "Garten-/Landschaftsbau" },
  { value: "allgemein", label: "Allgemeine Handwerksarbeiten" },
]

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [userType, setUserType] = useState<"kunde" | "handwerker">("kunde")
  const [tradeCategory, setTradeCategory] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwörter stimmen nicht überein")
      setIsLoading(false)
      return
    }

    if (userType === "handwerker" && !tradeCategory) {
      setError("Bitte wählen Sie eine Handwerkskategorie aus")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            user_type: userType,
            first_name: firstName,
            last_name: lastName,
            trade_category: userType === "handwerker" ? tradeCategory : undefined,
          },
        },
      })
      if (error) throw error
      router.push("/auth/verify-email")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ein Fehler ist aufgetreten")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Logo/Brand */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Hammer className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">HandwerkApp</h1>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Verbinden Sie sich mit qualifizierten Handwerkern
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Registrieren</CardTitle>
              <CardDescription>Erstellen Sie Ihr Konto als Kunde oder Handwerker</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister}>
                <div className="flex flex-col gap-6">
                  {/* User Type Selection */}
                  <div className="grid gap-3">
                    <Label>Ich bin ein...</Label>
                    <RadioGroup
                      value={userType}
                      onValueChange={(value: "kunde" | "handwerker") => setUserType(value)}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="kunde" id="kunde" />
                        <Label htmlFor="kunde">Kunde</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="handwerker" id="handwerker" />
                        <Label htmlFor="handwerker">Handwerker</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Trade Category for Handwerker */}
                  {userType === "handwerker" && (
                    <div className="grid gap-2">
                      <Label htmlFor="trade-category">Handwerkskategorie</Label>
                      <Select value={tradeCategory} onValueChange={setTradeCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Wählen Sie Ihre Kategorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {tradeCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Personal Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">Vorname</Label>
                      <Input
                        id="firstName"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Nachname</Label>
                      <Input
                        id="lastName"
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">E-Mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="max@beispiel.de"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Passwort</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Registrieren..." : "Registrieren"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Bereits ein Konto?{" "}
                  <Link href="/auth/login" className="underline underline-offset-4 text-primary hover:text-primary/80">
                    Anmelden
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
