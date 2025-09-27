"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  Building2,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  MessageSquare,
  Mail,
  Phone,
  Save,
  Upload,
} from "lucide-react"

interface CompanySettings {
  name: string
  address: string
  phone: string
  email: string
  website: string
  taxId: string
  logo?: string
  description: string
}

interface UserSettings {
  name: string
  email: string
  phone: string
  role: string
  avatar?: string
  language: string
  timezone: string
}

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  whatsappNotifications: boolean
  newInquiries: boolean
  followUpReminders: boolean
  contractUpdates: boolean
  materialAlerts: boolean
  projectUpdates: boolean
}

interface SystemSettings {
  theme: "light" | "dark" | "system"
  currency: string
  dateFormat: string
  numberFormat: string
  defaultTaxRate: number
  autoBackup: boolean
  dataRetention: number
}

export default function SettingsPage() {
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: "Handwerk GmbH",
    address: "Musterstraße 123\n12345 Musterstadt",
    phone: "+49 40 123456789",
    email: "info@handwerk-gmbh.de",
    website: "www.handwerk-gmbh.de",
    taxId: "DE123456789",
    description: "Spezialist für WDVS-Sanierung und Fassadenarbeiten",
  })

  const [userSettings, setUserSettings] = useState<UserSettings>({
    name: "Max Mustermann",
    email: "max.mustermann@handwerk-gmbh.de",
    phone: "+49 40 123456789",
    role: "Administrator",
    language: "de",
    timezone: "Europe/Berlin",
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    whatsappNotifications: true,
    newInquiries: true,
    followUpReminders: true,
    contractUpdates: true,
    materialAlerts: true,
    projectUpdates: false,
  })

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    theme: "system",
    currency: "EUR",
    dateFormat: "DD.MM.YYYY",
    numberFormat: "de-DE",
    defaultTaxRate: 19,
    autoBackup: true,
    dataRetention: 7,
  })

  const handleSaveSettings = (section: string) => {
    console.log("[v0] Saving settings for section:", section)
    // Mock save operation
    setTimeout(() => {
      console.log("[v0] Settings saved successfully")
    }, 1000)
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log("[v0] Uploading logo:", file.name)
      const logoUrl = URL.createObjectURL(file)
      setCompanySettings({ ...companySettings, logo: logoUrl })
    }
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log("[v0] Uploading avatar:", file.name)
      const avatarUrl = URL.createObjectURL(file)
      setUserSettings({ ...userSettings, avatar: avatarUrl })
    }
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
              <h1 className="text-2xl font-bold text-foreground">Einstellungen</h1>
            </div>
            <p className="text-muted-foreground mt-2">System- und Benutzereinstellungen verwalten</p>
          </div>

          <Tabs defaultValue="company" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Unternehmen
              </TabsTrigger>
              <TabsTrigger value="user" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Benutzer
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Benachrichtigungen
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                System
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Integrationen
              </TabsTrigger>
            </TabsList>

            <TabsContent value="company" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Unternehmensdaten
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="company-name">Firmenname</Label>
                        <Input
                          id="company-name"
                          value={companySettings.name}
                          onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="company-address">Adresse</Label>
                        <Textarea
                          id="company-address"
                          value={companySettings.address}
                          onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="company-phone">Telefon</Label>
                        <Input
                          id="company-phone"
                          value={companySettings.phone}
                          onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="company-email">E-Mail</Label>
                        <Input
                          id="company-email"
                          type="email"
                          value={companySettings.email}
                          onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="company-website">Website</Label>
                        <Input
                          id="company-website"
                          value={companySettings.website}
                          onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="company-tax-id">Steuernummer</Label>
                        <Input
                          id="company-tax-id"
                          value={companySettings.taxId}
                          onChange={(e) => setCompanySettings({ ...companySettings, taxId: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="company-description">Beschreibung</Label>
                        <Textarea
                          id="company-description"
                          value={companySettings.description}
                          onChange={(e) => setCompanySettings({ ...companySettings, description: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label>Firmenlogo</Label>
                        <div className="flex items-center gap-4 mt-2">
                          {companySettings.logo && (
                            <img
                              src={companySettings.logo || "/placeholder.svg"}
                              alt="Logo"
                              className="w-16 h-16 object-contain border rounded"
                            />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                            id="logo-upload"
                          />
                          <Button variant="outline" asChild>
                            <label htmlFor="logo-upload" className="cursor-pointer">
                              <Upload className="h-4 w-4 mr-2" />
                              Logo hochladen
                            </label>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button onClick={() => handleSaveSettings("company")}>
                      <Save className="h-4 w-4 mr-2" />
                      Speichern
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="user" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Benutzerprofil
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="user-name">Name</Label>
                        <Input
                          id="user-name"
                          value={userSettings.name}
                          onChange={(e) => setUserSettings({ ...userSettings, name: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="user-email">E-Mail</Label>
                        <Input
                          id="user-email"
                          type="email"
                          value={userSettings.email}
                          onChange={(e) => setUserSettings({ ...userSettings, email: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="user-phone">Telefon</Label>
                        <Input
                          id="user-phone"
                          value={userSettings.phone}
                          onChange={(e) => setUserSettings({ ...userSettings, phone: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="user-role">Rolle</Label>
                        <Select
                          value={userSettings.role}
                          onValueChange={(value) => setUserSettings({ ...userSettings, role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Administrator">Administrator</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                            <SelectItem value="Mitarbeiter">Mitarbeiter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="user-language">Sprache</Label>
                        <Select
                          value={userSettings.language}
                          onValueChange={(value) => setUserSettings({ ...userSettings, language: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="de">Deutsch</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="user-timezone">Zeitzone</Label>
                        <Select
                          value={userSettings.timezone}
                          onValueChange={(value) => setUserSettings({ ...userSettings, timezone: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                            <SelectItem value="Europe/Vienna">Europe/Vienna</SelectItem>
                            <SelectItem value="Europe/Zurich">Europe/Zurich</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Profilbild</Label>
                        <div className="flex items-center gap-4 mt-2">
                          {userSettings.avatar && (
                            <img
                              src={userSettings.avatar || "/placeholder.svg"}
                              alt="Avatar"
                              className="w-16 h-16 object-cover border rounded-full"
                            />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                            id="avatar-upload"
                          />
                          <Button variant="outline" asChild>
                            <label htmlFor="avatar-upload" className="cursor-pointer">
                              <Upload className="h-4 w-4 mr-2" />
                              Bild hochladen
                            </label>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button onClick={() => handleSaveSettings("user")}>
                      <Save className="h-4 w-4 mr-2" />
                      Speichern
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Benachrichtigungseinstellungen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Benachrichtigungskanäle</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <Label>E-Mail Benachrichtigungen</Label>
                        </div>
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <Label>SMS Benachrichtigungen</Label>
                        </div>
                        <Switch
                          checked={notificationSettings.smsNotifications}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, smsNotifications: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <Label>WhatsApp Benachrichtigungen</Label>
                        </div>
                        <Switch
                          checked={notificationSettings.whatsappNotifications}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, whatsappNotifications: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Ereignisse</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Neue Anfragen</Label>
                        <Switch
                          checked={notificationSettings.newInquiries}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, newInquiries: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Follow-up Erinnerungen</Label>
                        <Switch
                          checked={notificationSettings.followUpReminders}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, followUpReminders: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Vertragsänderungen</Label>
                        <Switch
                          checked={notificationSettings.contractUpdates}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, contractUpdates: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Material-Warnungen</Label>
                        <Switch
                          checked={notificationSettings.materialAlerts}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, materialAlerts: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Projekt-Updates</Label>
                        <Switch
                          checked={notificationSettings.projectUpdates}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, projectUpdates: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button onClick={() => handleSaveSettings("notifications")}>
                      <Save className="h-4 w-4 mr-2" />
                      Speichern
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Systemeinstellungen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="theme">Design</Label>
                        <Select
                          value={systemSettings.theme}
                          onValueChange={(value: any) => setSystemSettings({ ...systemSettings, theme: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Hell</SelectItem>
                            <SelectItem value="dark">Dunkel</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="currency">Währung</Label>
                        <Select
                          value={systemSettings.currency}
                          onValueChange={(value) => setSystemSettings({ ...systemSettings, currency: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EUR">Euro (€)</SelectItem>
                            <SelectItem value="USD">US Dollar ($)</SelectItem>
                            <SelectItem value="CHF">Schweizer Franken (CHF)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="date-format">Datumsformat</Label>
                        <Select
                          value={systemSettings.dateFormat}
                          onValueChange={(value) => setSystemSettings({ ...systemSettings, dateFormat: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="number-format">Zahlenformat</Label>
                        <Select
                          value={systemSettings.numberFormat}
                          onValueChange={(value) => setSystemSettings({ ...systemSettings, numberFormat: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="de-DE">Deutsch (1.234,56)</SelectItem>
                            <SelectItem value="en-US">Englisch (1,234.56)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="tax-rate">Standard Steuersatz (%)</Label>
                        <Input
                          id="tax-rate"
                          type="number"
                          min="0"
                          max="100"
                          value={systemSettings.defaultTaxRate}
                          onChange={(e) =>
                            setSystemSettings({ ...systemSettings, defaultTaxRate: Number(e.target.value) })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="data-retention">Datenaufbewahrung (Jahre)</Label>
                        <Input
                          id="data-retention"
                          type="number"
                          min="1"
                          max="20"
                          value={systemSettings.dataRetention}
                          onChange={(e) =>
                            setSystemSettings({ ...systemSettings, dataRetention: Number(e.target.value) })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Automatisierung</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Automatische Datensicherung</Label>
                        <p className="text-sm text-muted-foreground">Tägliche Sicherung aller Daten</p>
                      </div>
                      <Switch
                        checked={systemSettings.autoBackup}
                        onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, autoBackup: checked })}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button onClick={() => handleSaveSettings("system")}>
                      <Save className="h-4 w-4 mr-2" />
                      Speichern
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Integrationen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <MessageSquare className="h-8 w-8 text-green-600" />
                            <div>
                              <h4 className="font-medium">WhatsApp Business</h4>
                              <p className="text-sm text-muted-foreground">Automatisierte Nachrichten</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Mail className="h-8 w-8 text-blue-600" />
                            <div>
                              <h4 className="font-medium">E-Mail Service</h4>
                              <p className="text-sm text-muted-foreground">SMTP Konfiguration</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Database className="h-8 w-8 text-purple-600" />
                            <div>
                              <h4 className="font-medium">Supabase</h4>
                              <p className="text-sm text-muted-foreground">Datenbank & Auth</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Shield className="h-8 w-8 text-orange-600" />
                            <div>
                              <h4 className="font-medium">Backup Service</h4>
                              <p className="text-sm text-muted-foreground">Automatische Sicherung</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button onClick={() => handleSaveSettings("integrations")}>
                      <Save className="h-4 w-4 mr-2" />
                      Speichern
                    </Button>
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
