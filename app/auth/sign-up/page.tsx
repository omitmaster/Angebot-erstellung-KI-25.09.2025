"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Page() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [userType, setUserType] = useState<"kunde" | "handwerker">("kunde")
  const [tradeCategory, setTradeCategory] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (userType === "handwerker" && !tradeCategory) {
      setError("Please select a trade category")
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
            first_name: firstName,
            last_name: lastName,
            user_type: userType,
            trade_category: userType === "handwerker" ? tradeCategory : undefined,
          },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Konto erstellen</CardTitle>
              <CardDescription>Registrieren Sie sich als Kunde oder Handwerker</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="user-type">Ich bin ein</Label>
                    <Select value={userType} onValueChange={(value: "kunde" | "handwerker") => setUserType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kunde">Kunde</SelectItem>
                        <SelectItem value="handwerker">Handwerker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {userType === "handwerker" && (
                    <div className="grid gap-2">
                      <Label htmlFor="trade-category">Gewerk</Label>
                      <Select value={tradeCategory} onValueChange={setTradeCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Wählen Sie Ihr Gewerk" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electrician">Elektriker</SelectItem>
                          <SelectItem value="plumber">Klempner</SelectItem>
                          <SelectItem value="carpenter">Zimmermann</SelectItem>
                          <SelectItem value="painter">Maler</SelectItem>
                          <SelectItem value="roofer">Dachdecker</SelectItem>
                          <SelectItem value="heating">Heizung & Sanitär</SelectItem>
                          <SelectItem value="flooring">Bodenleger</SelectItem>
                          <SelectItem value="general">Allgemein</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="first-name">Vorname</Label>
                      <Input
                        id="first-name"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="last-name">Nachname</Label>
                      <Input
                        id="last-name"
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
                      placeholder="m@example.com"
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
                    <Label htmlFor="repeat-password">Passwort wiederholen</Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Konto wird erstellt..." : "Registrieren"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Bereits ein Konto?{" "}
                  <Link href="/auth/login" className="underline underline-offset-4">
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
