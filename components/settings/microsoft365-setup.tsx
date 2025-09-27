"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Mail,
  FileText,
  MessageSquare,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  TestTube,
  Save,
  HelpCircle,
} from "lucide-react"

interface Microsoft365Config {
  isActive: boolean
  tenantId: string
  clientId: string
  clientSecret: string
  senderEmail: string
  senderName: string
  sharepointSiteUrl: string
  documentLibrary: string
  teamsWebhookUrl: string
  defaultChannel: string
  syncStatus: "disconnected" | "connected" | "error"
}

const initialConfig: Microsoft365Config = {
  isActive: false,
  tenantId: "",
  clientId: "",
  clientSecret: "",
  senderEmail: "",
  senderName: "",
  sharepointSiteUrl: "",
  documentLibrary: "Angebote",
  teamsWebhookUrl: "",
  defaultChannel: "Allgemein",
  syncStatus: "disconnected",
}

export function Microsoft365Setup() {
  const [config, setConfig] = useState<Microsoft365Config>(initialConfig)
  const [showClientSecret, setShowClientSecret] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Hier würde die Konfiguration gespeichert werden
      console.log("Saving Microsoft 365 config:", config)
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
      setConfig({ ...config, syncStatus: "connected" })
    } catch (error) {
      console.error("Error saving config:", error)
      setConfig({ ...config, syncStatus: "error" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    try {
      // Hier würde die Verbindung getestet werden
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API call
      setTestResults({
        success: true,
        details: {
          authentication: true,
          email: true,
          sharepoint: !!config.sharepointSiteUrl,
          teams: !!config.teamsWebhookUrl,
        },
      })
    } catch (error) {
      setTestResults({
        success: false,
        error: "Verbindung fehlgeschlagen",
        details: {
          authentication: false,
          email: false,
          sharepoint: false,
          teams: false,
        },
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const getStatusBadge = () => {
    switch (config.syncStatus) {
      case "connected":
        return <Badge className="bg-green-100 text-green-800">Verbunden</Badge>
      case "error":
        return <Badge variant="destructive">Fehler</Badge>
      default:
        return <Badge variant="secondary">Nicht verbunden</Badge>
    }
  }

  const getStatusIcon = () => {
    switch (config.syncStatus) {
      case "connected":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Übersicht */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <CardTitle>Microsoft 365 Integration</CardTitle>
                <CardDescription>
                  Verbinden Sie Ihr System mit Microsoft 365 für E-Mail-Versand und Dokumentenverwaltung
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge()}
              <Switch
                checked={config.isActive}
                onCheckedChange={(checked) => setConfig({ ...config, isActive: checked })}
              />
            </div>
          </div>
        </CardHeader>

        {config.isActive && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Mail className="h-8 w-8 text-blue-600" />
                <div>
                  <h4 className="font-medium">E-Mail</h4>
                  <p className="text-sm text-muted-foreground">{config.senderEmail || "Nicht konfiguriert"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <FileText className="h-8 w-8 text-green-600" />
                <div>
                  <h4 className="font-medium">SharePoint</h4>
                  <p className="text-sm text-muted-foreground">
                    {config.sharepointSiteUrl ? "Konfiguriert" : "Optional"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <MessageSquare className="h-8 w-8 text-purple-600" />
                <div>
                  <h4 className="font-medium">Teams</h4>
                  <p className="text-sm text-muted-foreground">
                    {config.teamsWebhookUrl ? "Konfiguriert" : "Optional"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {config.isActive && (
        <Tabs defaultValue="authentication" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="authentication">Authentifizierung</TabsTrigger>
            <TabsTrigger value="email">E-Mail</TabsTrigger>
            <TabsTrigger value="sharepoint">SharePoint</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
          </TabsList>

          <TabsContent value="authentication" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Azure App Registration
                </CardTitle>
                <CardDescription>
                  Konfigurieren Sie die Azure Active Directory App Registration für die API-Zugriffe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <HelpCircle className="h-4 w-4" />
                  <AlertDescription>
                    Sie benötigen eine Azure App Registration mit den Berechtigungen: Mail.Send, Sites.ReadWrite.All,
                    User.Read
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tenant-id">Tenant ID</Label>
                    <Input
                      id="tenant-id"
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      value={config.tenantId}
                      onChange={(e) => setConfig({ ...config, tenantId: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client-id">Client ID (Application ID)</Label>
                    <Input
                      id="client-id"
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      value={config.clientId}
                      onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-secret">Client Secret</Label>
                  <div className="relative">
                    <Input
                      id="client-secret"
                      type={showClientSecret ? "text" : "password"}
                      placeholder="Ihr Client Secret"
                      value={config.clientSecret}
                      onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowClientSecret(!showClientSecret)}
                    >
                      {showClientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full bg-transparent">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Setup-Anleitung anzeigen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Azure App Registration Setup</DialogTitle>
                      <DialogDescription>
                        Folgen Sie diesen Schritten, um eine Azure App Registration zu erstellen
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">1. Azure Portal öffnen</h4>
                        <p className="text-sm text-muted-foreground">
                          Gehen Sie zu portal.azure.com und melden Sie sich mit Ihrem Microsoft 365 Admin-Konto an.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">2. App Registration erstellen</h4>
                        <p className="text-sm text-muted-foreground">
                          Navigieren Sie zu "Azure Active Directory" → "App registrations" → "New registration"
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">3. Berechtigungen hinzufügen</h4>
                        <p className="text-sm text-muted-foreground">
                          Fügen Sie folgende Microsoft Graph Berechtigungen hinzu: Mail.Send, Sites.ReadWrite.All,
                          User.Read
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">4. Client Secret erstellen</h4>
                        <p className="text-sm text-muted-foreground">
                          Gehen Sie zu "Certificates & secrets" und erstellen Sie ein neues Client Secret
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  E-Mail Konfiguration
                </CardTitle>
                <CardDescription>Konfigurieren Sie den E-Mail-Versand über Microsoft 365</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sender-email">Absender E-Mail</Label>
                    <Input
                      id="sender-email"
                      type="email"
                      placeholder="angebote@ihr-unternehmen.de"
                      value={config.senderEmail}
                      onChange={(e) => setConfig({ ...config, senderEmail: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sender-name">Absender Name</Label>
                    <Input
                      id="sender-name"
                      placeholder="Ihr Unternehmen"
                      value={config.senderName}
                      onChange={(e) => setConfig({ ...config, senderName: e.target.value })}
                    />
                  </div>
                </div>

                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    Die Absender-E-Mail muss ein gültiges Microsoft 365 Postfach sein, auf das die App zugreifen kann.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sharepoint" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  SharePoint Integration
                </CardTitle>
                <CardDescription>
                  Optional: Speichern Sie Angebote automatisch in SharePoint (empfohlen)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sharepoint-url">SharePoint Site URL</Label>
                  <Input
                    id="sharepoint-url"
                    placeholder="https://ihrunternehmen.sharepoint.com/sites/angebote"
                    value={config.sharepointSiteUrl}
                    onChange={(e) => setConfig({ ...config, sharepointSiteUrl: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document-library">Dokumentenbibliothek</Label>
                  <Input
                    id="document-library"
                    placeholder="Angebote"
                    value={config.documentLibrary}
                    onChange={(e) => setConfig({ ...config, documentLibrary: e.target.value })}
                  />
                </div>

                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Angebote werden automatisch in Ordnern nach Jahr organisiert (z.B. "Angebote/2024/")
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Teams Integration
                </CardTitle>
                <CardDescription>
                  Optional: Erhalten Sie Benachrichtigungen über neue Angebote in Microsoft Teams
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teams-webhook">Teams Webhook URL</Label>
                  <Textarea
                    id="teams-webhook"
                    placeholder="https://outlook.office.com/webhook/..."
                    value={config.teamsWebhookUrl}
                    onChange={(e) => setConfig({ ...config, teamsWebhookUrl: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-channel">Standard Kanal</Label>
                  <Input
                    id="default-channel"
                    placeholder="Allgemein"
                    value={config.defaultChannel}
                    onChange={(e) => setConfig({ ...config, defaultChannel: e.target.value })}
                  />
                </div>

                <Alert>
                  <MessageSquare className="h-4 w-4" />
                  <AlertDescription>
                    Erstellen Sie einen Incoming Webhook in Ihrem Teams-Kanal und fügen Sie die URL hier ein.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {config.isActive && (
        <Card>
          <CardHeader>
            <CardTitle>Verbindung testen & Speichern</CardTitle>
            <CardDescription>Testen Sie die Konfiguration bevor Sie sie speichern</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTestingConnection || !config.tenantId || !config.clientId || !config.clientSecret}
              >
                <TestTube className="h-4 w-4 mr-2" />
                {isTestingConnection ? "Teste Verbindung..." : "Verbindung testen"}
              </Button>

              <Button
                onClick={handleSave}
                disabled={isSaving || !config.tenantId || !config.clientId || !config.clientSecret}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Speichere..." : "Konfiguration speichern"}
              </Button>
            </div>

            {testResults && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {testResults.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {testResults.success ? "Verbindung erfolgreich" : "Verbindung fehlgeschlagen"}
                  </span>
                </div>

                {testResults.details && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    <div className="flex items-center gap-2 text-sm">
                      {testResults.details.authentication ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      Authentifizierung
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {testResults.details.email ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      E-Mail
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {testResults.details.sharepoint ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                      SharePoint
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {testResults.details.teams ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                      Teams
                    </div>
                  </div>
                )}

                {testResults.error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{testResults.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
