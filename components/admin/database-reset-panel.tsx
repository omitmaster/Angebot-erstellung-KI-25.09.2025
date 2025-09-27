"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Database, RefreshCw, Plus } from "lucide-react"
import { resetDatabase, createSampleData } from "@/lib/actions/database-actions"
import { toast } from "@/hooks/use-toast"

export function DatabaseResetPanel() {
  const [isResetting, setIsResetting] = useState(false)
  const [isCreatingSample, setIsCreatingSample] = useState(false)

  const handleReset = async () => {
    if (!confirm("Sind Sie sicher, dass Sie die gesamte Datenbank zurücksetzen möchten? Alle Daten gehen verloren!")) {
      return
    }

    setIsResetting(true)
    try {
      const result = await resetDatabase()
      if (result.success) {
        toast({
          title: "Erfolg",
          description: result.message,
        })
      } else {
        toast({
          title: "Fehler",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Unerwarteter Fehler beim Zurücksetzen",
        variant: "destructive",
      })
    } finally {
      setIsResetting(false)
    }
  }

  const handleCreateSample = async () => {
    setIsCreatingSample(true)
    try {
      const result = await createSampleData()
      if (result.success) {
        toast({
          title: "Erfolg",
          description: result.message,
        })
      } else {
        toast({
          title: "Fehler",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Unerwarteter Fehler beim Erstellen der Beispieldaten",
        variant: "destructive",
      })
    } finally {
      setIsCreatingSample(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Datenbank zurücksetzen
          </CardTitle>
          <CardDescription>
            Setzt die gesamte Datenbank auf den Ausgangszustand zurück. Alle Benutzerdaten, Projekte und Einstellungen
            werden gelöscht.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleReset} disabled={isResetting} className="w-full">
            {isResetting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Wird zurückgesetzt...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Datenbank komplett zurücksetzen
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Beispieldaten erstellen
          </CardTitle>
          <CardDescription>Erstellt Beispieldaten zum Testen der Anwendung.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleCreateSample}
            disabled={isCreatingSample}
            className="w-full bg-transparent"
          >
            {isCreatingSample ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Wird erstellt...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Beispieldaten erstellen
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
