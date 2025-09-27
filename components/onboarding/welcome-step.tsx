"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Hammer, Users, ArrowRight } from "lucide-react"
import { useState } from "react"

interface WelcomeStepProps {
  onNext: () => void
  onBack: () => void
  data: any
  setData: (data: any) => void
}

export function WelcomeStep({ onNext, data, setData }: WelcomeStepProps) {
  const [userType, setUserType] = useState(data.userType || "")

  const handleNext = () => {
    if (userType) {
      setData({ userType })
      onNext()
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Hammer className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Willkommen bei HandwerkApp!</CardTitle>
        <CardDescription className="text-lg">
          Lassen Sie uns Ihr Konto einrichten. Sind Sie Handwerker oder Kunde?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={userType} onValueChange={setUserType} className="grid grid-cols-1 gap-4">
          <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="handwerker" id="handwerker" />
            <Label htmlFor="handwerker" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-3">
                <Hammer className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Ich bin Handwerker</div>
                  <div className="text-sm text-muted-foreground">Ich biete handwerkliche Dienstleistungen an</div>
                </div>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="kunde" id="kunde" />
            <Label htmlFor="kunde" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Ich bin Kunde</div>
                  <div className="text-sm text-muted-foreground">Ich suche handwerkliche Dienstleistungen</div>
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>

        <div className="flex justify-end">
          <Button onClick={handleNext} disabled={!userType} className="min-w-32">
            Weiter
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
