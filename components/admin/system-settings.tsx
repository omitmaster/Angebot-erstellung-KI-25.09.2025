"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, AlertCircle, CheckCircle } from "lucide-react"

interface SystemSetting {
  key: string
  value: string
  description: string
}

interface SystemSettingsProps {
  currentUser: any
}

export function SystemSettings({ currentUser }: SystemSettingsProps) {
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("system_settings").select("*").order("key")

      if (error) throw error
      setSettings(data || [])
    } catch (error) {
      console.error("Error fetching settings:", error)
      setMessage({ type: "error", text: "Fehler beim Laden der Einstellungen" })
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase.from("system_settings").upsert({ key, value })

      if (error) throw error

      setSettings((prev) => prev.map((setting) => (setting.key === key ? { ...setting, value } : setting)))
    } catch (error) {
      console.error("Error updating setting:", error)
      throw error
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    setMessage(null)

    try {
      // Save all settings
      await Promise.all(settings.map((setting) => updateSetting(setting.key, setting.value)))

      setMessage({ type: "success", text: "Einstellungen erfolgreich gespeichert" })
    } catch (error) {
      setMessage({ type: "error", text: "Fehler beim Speichern der Einstellungen" })
    } finally {
      setSaving(false)
    }
  }

  const getSetting = (key: string) => {
    return settings.find((s) => s.key === key)?.value || ""
  }

  const updateSettingValue = (key: string, value: string) => {
    setSettings((prev) => prev.map((setting) => (setting.key === key ? { ...setting, value } : setting)))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Systemeinstellungen</h2>
          <p className="text-muted-foreground">Konfigurieren Sie die Plattformeinstellungen</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Speichern..." : "Speichern"}
        </Button>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          {message.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="payments">Zahlungen</TabsTrigger>
          <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Allgemeine Einstellungen</CardTitle>
              <CardDescription>Grundlegende Plattformkonfiguration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform_name">Plattformname</Label>
                <Input
                  id="platform_name"
                  value={getSetting("platform_name")}
                  onChange={(e) => updateSettingValue("platform_name", e.target.value)}
                  placeholder="HandwerkApp"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support_email">Support E-Mail</Label>
                <Input
                  id="support_email"
                  type="email"
                  value={getSetting("support_email")}
                  onChange={(e) => updateSettingValue("support_email", e.target.value)}
                  placeholder="support@handwerkapp.de"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_job_duration">Max. Auftragsdauer (Tage)</Label>
                <Input
                  id="max_job_duration"
                  type="number"
                  value={getSetting("max_job_duration")}
                  onChange={(e) => updateSettingValue("max_job_duration", e.target.value)}
                  placeholder="365"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenance_mode"
                  checked={getSetting("maintenance_mode") === "true"}
                  onCheckedChange={(checked) => updateSettingValue("maintenance_mode", checked.toString())}
                />
                <Label htmlFor="maintenance_mode">Wartungsmodus aktiviert</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Zahlungseinstellungen</CardTitle>
              <CardDescription>Konfiguration für Zahlungen und Gebühren</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform_fee_percentage">Plattformgebühr (%)</Label>
                <Input
                  id="platform_fee_percentage"
                  type="number"
                  step="0.1"
                  value={getSetting("platform_fee_percentage")}
                  onChange={(e) => updateSettingValue("platform_fee_percentage", e.target.value)}
                  placeholder="5.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_payout_amount">Mindestausschüttung (€)</Label>
                <Input
                  id="min_payout_amount"
                  type="number"
                  value={getSetting("min_payout_amount")}
                  onChange={(e) => updateSettingValue("min_payout_amount", e.target.value)}
                  placeholder="50"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto_payout_enabled"
                  checked={getSetting("auto_payout_enabled") === "true"}
                  onCheckedChange={(checked) => updateSettingValue("auto_payout_enabled", checked.toString())}
                />
                <Label htmlFor="auto_payout_enabled">Automatische Ausschüttung aktiviert</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Benachrichtigungseinstellungen</CardTitle>
              <CardDescription>E-Mail und Push-Benachrichtigungen konfigurieren</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="email_notifications_enabled"
                  checked={getSetting("email_notifications_enabled") === "true"}
                  onCheckedChange={(checked) => updateSettingValue("email_notifications_enabled", checked.toString())}
                />
                <Label htmlFor="email_notifications_enabled">E-Mail Benachrichtigungen aktiviert</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="sms_notifications_enabled"
                  checked={getSetting("sms_notifications_enabled") === "true"}
                  onCheckedChange={(checked) => updateSettingValue("sms_notifications_enabled", checked.toString())}
                />
                <Label htmlFor="sms_notifications_enabled">SMS Benachrichtigungen aktiviert</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notification_sender_email">Absender E-Mail</Label>
                <Input
                  id="notification_sender_email"
                  type="email"
                  value={getSetting("notification_sender_email")}
                  onChange={(e) => updateSettingValue("notification_sender_email", e.target.value)}
                  placeholder="noreply@handwerkapp.de"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation">
          <Card>
            <CardHeader>
              <CardTitle>Moderationseinstellungen</CardTitle>
              <CardDescription>Inhaltsmoderation und Sicherheitseinstellungen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto_moderation_enabled"
                  checked={getSetting("auto_moderation_enabled") === "true"}
                  onCheckedChange={(checked) => updateSettingValue("auto_moderation_enabled", checked.toString())}
                />
                <Label htmlFor="auto_moderation_enabled">Automatische Moderation aktiviert</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="review_moderation_enabled"
                  checked={getSetting("review_moderation_enabled") === "true"}
                  onCheckedChange={(checked) => updateSettingValue("review_moderation_enabled", checked.toString())}
                />
                <Label htmlFor="review_moderation_enabled">Bewertungsmoderation aktiviert</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_images_per_job">Max. Bilder pro Auftrag</Label>
                <Input
                  id="max_images_per_job"
                  type="number"
                  value={getSetting("max_images_per_job")}
                  onChange={(e) => updateSettingValue("max_images_per_job", e.target.value)}
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blocked_words">Gesperrte Wörter (kommagetrennt)</Label>
                <Textarea
                  id="blocked_words"
                  value={getSetting("blocked_words")}
                  onChange={(e) => updateSettingValue("blocked_words", e.target.value)}
                  placeholder="spam, betrug, illegal"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
