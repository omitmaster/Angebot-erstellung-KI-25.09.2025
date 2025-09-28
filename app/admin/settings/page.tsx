"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Shield,
  Database,
  Users,
  Activity,
  AlertTriangle,
  Download,
  Trash2,
  RefreshCw,
  Server,
  Lock,
  Key,
  Mail,
  Bell,
  Save,
  Eye,
  EyeOff,
} from "lucide-react"

interface SystemConfig {
  maintenanceMode: boolean
  allowRegistration: boolean
  requireEmailVerification: boolean
  sessionTimeout: number
  maxFileSize: number
  backupFrequency: string
  logLevel: string
}

interface SecuritySettings {
  passwordMinLength: number
  requireSpecialChars: boolean
  requireNumbers: boolean
  requireUppercase: boolean
  maxLoginAttempts: number
  lockoutDuration: number
  twoFactorRequired: boolean
}

interface EmailConfig {
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPassword: string
  fromEmail: string
  fromName: string
  useSSL: boolean
}

export default function AdminSettingsPage() {
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    sessionTimeout: 24,
    maxFileSize: 10,
    backupFrequency: "daily",
    logLevel: "info",
  })

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    twoFactorRequired: false,
  })

  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "",
    fromName: "Handwerk App",
    useSSL: true,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveConfig = async (section: string) => {
    setIsLoading(true)
    console.log(`[v0] Saving ${section} configuration`)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log(`[v0] ${section} configuration saved successfully`)
    setIsLoading(false)
  }

  const handleBackupNow = async () => {
    setIsLoading(true)
    console.log("[v0] Starting manual backup")

    // Simulate backup process
    await new Promise((resolve) => setTimeout(resolve, 3000))

    console.log("[v0] Backup completed successfully")
    setIsLoading(false)
  }

  const handleTestEmail = async () => {
    setIsLoading(true)
    console.log("[v0] Testing email configuration")

    // Simulate email test
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("[v0] Test email sent successfully")
    setIsLoading(false)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <Header />

        <main className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Settings className="h-6 w-6" />
              <h1 className="text-2xl font-bold text-foreground">Admin Einstellungen</h1>
            </div>
            <p className="text-muted-foreground mt-2">System-Konfiguration und erweiterte Einstellungen</p>
          </div>

          <Tabs defaultValue="system" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                System
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Sicherheit
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                E-Mail
              </TabsTrigger>
              <TabsTrigger value="backup" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Backup
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Benutzer
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Monitoring
              </TabsTrigger>
            </TabsList>

            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    System-Konfiguration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Maintenance Mode */}
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Wartungsmodus</h3>
                      <p className="text-sm text-muted-foreground">
                        Sperrt den Zugang für alle Benutzer außer Administratoren
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {systemConfig.maintenanceMode && <Badge variant="destructive">Aktiv</Badge>}
                      <Switch
                        checked={systemConfig.maintenanceMode}
                        onCheckedChange={(checked) => setSystemConfig({ ...systemConfig, maintenanceMode: checked })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Registrierung erlauben</Label>
                        <Switch
                          checked={systemConfig.allowRegistration}
                          onCheckedChange={(checked) =>
                            setSystemConfig({ ...systemConfig, allowRegistration: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>E-Mail Verifizierung erforderlich</Label>
                        <Switch
                          checked={systemConfig.requireEmailVerification}
                          onCheckedChange={(checked) =>
                            setSystemConfig({ ...systemConfig, requireEmailVerification: checked })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="session-timeout">Session Timeout (Stunden)</Label>
                        <Input
                          id="session-timeout"
                          type="number"
                          min="1"
                          max="168"
                          value={systemConfig.sessionTimeout}
                          onChange={(e) => setSystemConfig({ ...systemConfig, sessionTimeout: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="max-file-size">Max. Dateigröße (MB)</Label>
                        <Input
                          id="max-file-size"
                          type="number"
                          min="1"
                          max="100"
                          value={systemConfig.maxFileSize}
                          onChange={(e) => setSystemConfig({ ...systemConfig, maxFileSize: Number(e.target.value) })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="backup-frequency">Backup Häufigkeit</Label>
                        <Select
                          value={systemConfig.backupFrequency}
                          onValueChange={(value) => setSystemConfig({ ...systemConfig, backupFrequency: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Stündlich</SelectItem>
                            <SelectItem value="daily">Täglich</SelectItem>
                            <SelectItem value="weekly">Wöchentlich</SelectItem>
                            <SelectItem value="monthly">Monatlich</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="log-level">Log Level</Label>
                        <Select
                          value={systemConfig.logLevel}
                          onValueChange={(value) => setSystemConfig({ ...systemConfig, logLevel: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="error">Error</SelectItem>
                            <SelectItem value="warn">Warning</SelectItem>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="debug">Debug</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button onClick={() => handleSaveConfig("system")} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Speichere..." : "Speichern"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Sicherheitseinstellungen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Passwort-Richtlinien</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="password-min-length">Mindestlänge</Label>
                          <Input
                            id="password-min-length"
                            type="number"
                            min="6"
                            max="32"
                            value={securitySettings.passwordMinLength}
                            onChange={(e) =>
                              setSecuritySettings({ ...securitySettings, passwordMinLength: Number(e.target.value) })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label>Sonderzeichen erforderlich</Label>
                          <Switch
                            checked={securitySettings.requireSpecialChars}
                            onCheckedChange={(checked) =>
                              setSecuritySettings({ ...securitySettings, requireSpecialChars: checked })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label>Zahlen erforderlich</Label>
                          <Switch
                            checked={securitySettings.requireNumbers}
                            onCheckedChange={(checked) =>
                              setSecuritySettings({ ...securitySettings, requireNumbers: checked })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Großbuchstaben erforderlich</Label>
                          <Switch
                            checked={securitySettings.requireUppercase}
                            onCheckedChange={(checked) =>
                              setSecuritySettings({ ...securitySettings, requireUppercase: checked })
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="max-login-attempts">Max. Login-Versuche</Label>
                          <Input
                            id="max-login-attempts"
                            type="number"
                            min="3"
                            max="10"
                            value={securitySettings.maxLoginAttempts}
                            onChange={(e) =>
                              setSecuritySettings({ ...securitySettings, maxLoginAttempts: Number(e.target.value) })
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="lockout-duration">Sperrzeit (Minuten)</Label>
                          <Input
                            id="lockout-duration"
                            type="number"
                            min="5"
                            max="60"
                            value={securitySettings.lockoutDuration}
                            onChange={(e) =>
                              setSecuritySettings({ ...securitySettings, lockoutDuration: Number(e.target.value) })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Zwei-Faktor-Authentifizierung</h3>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <h4 className="font-medium">2FA für alle Benutzer erforderlich</h4>
                        <p className="text-sm text-muted-foreground">
                          Erhöht die Sicherheit durch zusätzliche Authentifizierung
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.twoFactorRequired}
                        onCheckedChange={(checked) =>
                          setSecuritySettings({ ...securitySettings, twoFactorRequired: checked })
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button onClick={() => handleSaveConfig("security")} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Speichere..." : "Speichern"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    E-Mail Konfiguration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="smtp-host">SMTP Host</Label>
                        <Input
                          id="smtp-host"
                          value={emailConfig.smtpHost}
                          onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                          placeholder="smtp.gmail.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="smtp-port">SMTP Port</Label>
                        <Input
                          id="smtp-port"
                          type="number"
                          value={emailConfig.smtpPort}
                          onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: Number(e.target.value) })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="smtp-user">SMTP Benutzer</Label>
                        <Input
                          id="smtp-user"
                          value={emailConfig.smtpUser}
                          onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                          placeholder="user@example.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="smtp-password">SMTP Passwort</Label>
                        <div className="relative">
                          <Input
                            id="smtp-password"
                            type={showPassword ? "text" : "password"}
                            value={emailConfig.smtpPassword}
                            onChange={(e) => setEmailConfig({ ...emailConfig, smtpPassword: e.target.value })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="from-email">Absender E-Mail</Label>
                        <Input
                          id="from-email"
                          type="email"
                          value={emailConfig.fromEmail}
                          onChange={(e) => setEmailConfig({ ...emailConfig, fromEmail: e.target.value })}
                          placeholder="noreply@handwerk-app.de"
                        />
                      </div>

                      <div>
                        <Label htmlFor="from-name">Absender Name</Label>
                        <Input
                          id="from-name"
                          value={emailConfig.fromName}
                          onChange={(e) => setEmailConfig({ ...emailConfig, fromName: e.target.value })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>SSL/TLS verwenden</Label>
                        <Switch
                          checked={emailConfig.useSSL}
                          onCheckedChange={(checked) => setEmailConfig({ ...emailConfig, useSSL: checked })}
                        />
                      </div>

                      <div className="pt-4">
                        <Button
                          variant="outline"
                          onClick={handleTestEmail}
                          disabled={isLoading}
                          className="w-full bg-transparent"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          {isLoading ? "Teste..." : "Test-E-Mail senden"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button onClick={() => handleSaveConfig("email")} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Speichere..." : "Speichern"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="backup" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Backup & Wiederherstellung
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-2">Letztes Backup</h3>
                        <p className="text-sm text-muted-foreground mb-4">Heute, 03:00 Uhr (automatisch)</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Herunterladen
                          </Button>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Wiederherstellen
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-2">Manuelles Backup</h3>
                        <p className="text-sm text-muted-foreground mb-4">Erstelle sofort ein vollständiges Backup</p>
                        <Button onClick={handleBackupNow} disabled={isLoading} className="w-full">
                          <Database className="h-4 w-4 mr-2" />
                          {isLoading ? "Erstelle Backup..." : "Backup jetzt erstellen"}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Backup Historie</h3>
                    <div className="space-y-2">
                      {[
                        { date: "2024-01-15 03:00", size: "2.4 GB", type: "Automatisch" },
                        { date: "2024-01-14 03:00", size: "2.3 GB", type: "Automatisch" },
                        { date: "2024-01-13 15:30", size: "2.3 GB", type: "Manuell" },
                        { date: "2024-01-13 03:00", size: "2.2 GB", type: "Automatisch" },
                      ].map((backup, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{backup.date}</p>
                            <p className="text-sm text-muted-foreground">
                              {backup.size} • {backup.type}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Benutzer-Verwaltung
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <h3 className="text-2xl font-bold">24</h3>
                        <p className="text-sm text-muted-foreground">Aktive Benutzer</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <h3 className="text-2xl font-bold">3</h3>
                        <p className="text-sm text-muted-foreground">Gesperrte Accounts</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <h3 className="text-2xl font-bold">7</h3>
                        <p className="text-sm text-muted-foreground">Neue diese Woche</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Benutzer-Aktionen</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="justify-start bg-transparent">
                        <Users className="h-4 w-4 mr-2" />
                        Alle Benutzer anzeigen
                      </Button>
                      <Button variant="outline" className="justify-start bg-transparent">
                        <Lock className="h-4 w-4 mr-2" />
                        Gesperrte Accounts verwalten
                      </Button>
                      <Button variant="outline" className="justify-start bg-transparent">
                        <Key className="h-4 w-4 mr-2" />
                        Passwort-Resets
                      </Button>
                      <Button variant="outline" className="justify-start bg-transparent">
                        <Bell className="h-4 w-4 mr-2" />
                        Benachrichtigungen senden
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System-Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <h3 className="text-2xl font-bold text-green-600">99.9%</h3>
                        <p className="text-sm text-muted-foreground">Uptime</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <h3 className="text-2xl font-bold">45ms</h3>
                        <p className="text-sm text-muted-foreground">Antwortzeit</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <h3 className="text-2xl font-bold">2.4GB</h3>
                        <p className="text-sm text-muted-foreground">DB Größe</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <h3 className="text-2xl font-bold">156</h3>
                        <p className="text-sm text-muted-foreground">API Calls/min</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">System-Status</h3>
                    <div className="space-y-3">
                      {[
                        { service: "Datenbank", status: "online", color: "green" },
                        { service: "E-Mail Service", status: "online", color: "green" },
                        { service: "Backup Service", status: "online", color: "green" },
                        { service: "WhatsApp API", status: "warning", color: "yellow" },
                      ].map((service, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full bg-${service.color}-500`} />
                            <span className="font-medium">{service.service}</span>
                          </div>
                          <Badge variant={service.status === "online" ? "default" : "secondary"}>
                            {service.status === "online" ? "Online" : "Warnung"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Aktuelle Warnungen</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-yellow-800">WhatsApp API Limit erreicht</p>
                          <p className="text-sm text-yellow-600">Tägliches Nachrichtenlimit zu 85% erreicht</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
