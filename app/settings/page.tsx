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
import { Badge } from "@/components/ui/badge"
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
  FileText,
  Eye,
  Download,
  Trash2,
} from "lucide-react"
import { Microsoft365Setup } from "@/components/settings/microsoft365-setup"

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

const initialBrandingSettings = {
  isActive: true,
  companyName: "Handwerk GmbH",
  companyAddress: "Musterstraße 123\n12345 Musterstadt",
  companyPhone: "+49 40 123456789",
  companyEmail: "info@handwerk-gmbh.de",
  companyWebsite: "www.handwerk-gmbh.de",
  taxNumber: "123/456/78901",
  vatNumber: "DE123456789",
  logoUrl: null,
  letterheadUrl: null,
  logoPosition: "top-left",
  primaryColor: "#1e40af",
  secondaryColor: "#10b981",
  textColor: "#1f2937",
  fontFamily: "Arial",
  fontSizeBody: 11,
  fontSizeHeading: 16,
  marginTopMm: 25,
  marginBottomMm: 20,
  marginLeftMm: 20,
  marginRightMm: 20,
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

  const [brandingSettings, setBrandingSettings] = useState(initialBrandingSettings)

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
      setBrandingSettings({ ...brandingSettings, logoUrl })
    }
  }

  const handleLetterheadUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log("[v0] Uploading letterhead:", file.name)
      const letterheadUrl = URL.createObjectURL(file)
      setBrandingSettings({ ...brandingSettings, letterheadUrl })
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
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Unternehmen
              </TabsTrigger>
              <TabsTrigger value="branding" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Briefkopf
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
              <TabsTrigger value="microsoft365" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Microsoft 365
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

            <TabsContent value="branding" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Briefkopf & Layout
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Gestalten Sie professionelle Angebote und Dokumente mit Ihrem Corporate Design
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Status und Aktivierung */}
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Briefkopf Status</h3>
                      <p className="text-sm text-muted-foreground">
                        {brandingSettings.isActive ? "Aktiv - wird in allen Dokumenten verwendet" : "Inaktiv"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {brandingSettings.isActive && <Badge variant="default">Aktiv</Badge>}
                      <Switch
                        checked={brandingSettings.isActive}
                        onCheckedChange={(checked) => setBrandingSettings({ ...brandingSettings, isActive: checked })}
                      />
                    </div>
                  </div>

                  {/* Firmeninformationen für Briefkopf */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Firmeninformationen</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="branding-company-name">Firmenname</Label>
                          <Input
                            id="branding-company-name"
                            value={brandingSettings.companyName}
                            onChange={(e) => setBrandingSettings({ ...brandingSettings, companyName: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="branding-address">Adresse</Label>
                          <Textarea
                            id="branding-address"
                            value={brandingSettings.companyAddress}
                            onChange={(e) =>
                              setBrandingSettings({ ...brandingSettings, companyAddress: e.target.value })
                            }
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="branding-phone">Telefon</Label>
                          <Input
                            id="branding-phone"
                            value={brandingSettings.companyPhone}
                            onChange={(e) => setBrandingSettings({ ...brandingSettings, companyPhone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="branding-email">E-Mail</Label>
                          <Input
                            id="branding-email"
                            type="email"
                            value={brandingSettings.companyEmail}
                            onChange={(e) => setBrandingSettings({ ...brandingSettings, companyEmail: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="branding-website">Website</Label>
                          <Input
                            id="branding-website"
                            value={brandingSettings.companyWebsite}
                            onChange={(e) =>
                              setBrandingSettings({ ...brandingSettings, companyWebsite: e.target.value })
                            }
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="tax-number">Steuernummer</Label>
                            <Input
                              id="tax-number"
                              value={brandingSettings.taxNumber}
                              onChange={(e) => setBrandingSettings({ ...brandingSettings, taxNumber: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="vat-number">USt-IdNr.</Label>
                            <Input
                              id="vat-number"
                              value={brandingSettings.vatNumber}
                              onChange={(e) => setBrandingSettings({ ...brandingSettings, vatNumber: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Logo und Briefkopf Upload */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Logo & Briefkopf</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label>Firmenlogo</Label>
                          <p className="text-sm text-muted-foreground mb-2">
                            Empfohlen: PNG/SVG, transparent, max. 2MB
                          </p>
                          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                            {brandingSettings.logoUrl ? (
                              <div className="space-y-2">
                                <img
                                  src={brandingSettings.logoUrl || "/placeholder.svg"}
                                  alt="Logo"
                                  className="max-h-20 mx-auto object-contain"
                                />
                                <div className="flex justify-center gap-2">
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Kein Logo hochgeladen</p>
                              </div>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                            id="logo-upload-branding"
                          />
                          <Button variant="outline" className="w-full mt-2 bg-transparent" asChild>
                            <label htmlFor="logo-upload-branding" className="cursor-pointer">
                              <Upload className="h-4 w-4 mr-2" />
                              Logo hochladen
                            </label>
                          </Button>
                        </div>

                        <div>
                          <Label htmlFor="logo-position">Logo Position</Label>
                          <Select
                            value={brandingSettings.logoPosition}
                            onValueChange={(value) => setBrandingSettings({ ...brandingSettings, logoPosition: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="top-left">Oben Links</SelectItem>
                              <SelectItem value="top-center">Oben Mitte</SelectItem>
                              <SelectItem value="top-right">Oben Rechts</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label>Vollständiger Briefkopf</Label>
                          <p className="text-sm text-muted-foreground mb-2">
                            Optional: Kompletter Briefkopf als Bild (PDF, PNG, JPG)
                          </p>
                          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                            {brandingSettings.letterheadUrl ? (
                              <div className="space-y-2">
                                <img
                                  src={brandingSettings.letterheadUrl || "/placeholder.svg"}
                                  alt="Briefkopf"
                                  className="max-h-20 mx-auto object-contain"
                                />
                                <div className="flex justify-center gap-2">
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Kein Briefkopf hochgeladen</p>
                              </div>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleLetterheadUpload}
                            className="hidden"
                            id="letterhead-upload"
                          />
                          <Button variant="outline" className="w-full mt-2 bg-transparent" asChild>
                            <label htmlFor="letterhead-upload" className="cursor-pointer">
                              <Upload className="h-4 w-4 mr-2" />
                              Briefkopf hochladen
                            </label>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Design & Farben */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Design & Farben</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="primary-color">Primärfarbe</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="primary-color"
                            type="color"
                            value={brandingSettings.primaryColor}
                            onChange={(e) => setBrandingSettings({ ...brandingSettings, primaryColor: e.target.value })}
                            className="w-16 h-10 p-1 border rounded"
                          />
                          <Input
                            value={brandingSettings.primaryColor}
                            onChange={(e) => setBrandingSettings({ ...brandingSettings, primaryColor: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="secondary-color">Sekundärfarbe</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="secondary-color"
                            type="color"
                            value={brandingSettings.secondaryColor}
                            onChange={(e) =>
                              setBrandingSettings({ ...brandingSettings, secondaryColor: e.target.value })
                            }
                            className="w-16 h-10 p-1 border rounded"
                          />
                          <Input
                            value={brandingSettings.secondaryColor}
                            onChange={(e) =>
                              setBrandingSettings({ ...brandingSettings, secondaryColor: e.target.value })
                            }
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="text-color">Textfarbe</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="text-color"
                            type="color"
                            value={brandingSettings.textColor}
                            onChange={(e) => setBrandingSettings({ ...brandingSettings, textColor: e.target.value })}
                            className="w-16 h-10 p-1 border rounded"
                          />
                          <Input
                            value={brandingSettings.textColor}
                            onChange={(e) => setBrandingSettings({ ...brandingSettings, textColor: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Typografie */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Typografie</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="font-family">Schriftart</Label>
                        <Select
                          value={brandingSettings.fontFamily}
                          onValueChange={(value) => setBrandingSettings({ ...brandingSettings, fontFamily: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Helvetica">Helvetica</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            <SelectItem value="Calibri">Calibri</SelectItem>
                            <SelectItem value="Open Sans">Open Sans</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="font-size-body">Fließtext (pt)</Label>
                        <Input
                          id="font-size-body"
                          type="number"
                          min="8"
                          max="16"
                          value={brandingSettings.fontSizeBody}
                          onChange={(e) =>
                            setBrandingSettings({ ...brandingSettings, fontSizeBody: Number(e.target.value) })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="font-size-heading">Überschriften (pt)</Label>
                        <Input
                          id="font-size-heading"
                          type="number"
                          min="12"
                          max="24"
                          value={brandingSettings.fontSizeHeading}
                          onChange={(e) =>
                            setBrandingSettings({ ...brandingSettings, fontSizeHeading: Number(e.target.value) })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Layout-Einstellungen */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Layout-Einstellungen</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="margin-top">Rand Oben (mm)</Label>
                        <Input
                          id="margin-top"
                          type="number"
                          min="10"
                          max="50"
                          value={brandingSettings.marginTopMm}
                          onChange={(e) =>
                            setBrandingSettings({ ...brandingSettings, marginTopMm: Number(e.target.value) })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="margin-bottom">Rand Unten (mm)</Label>
                        <Input
                          id="margin-bottom"
                          type="number"
                          min="10"
                          max="50"
                          value={brandingSettings.marginBottomMm}
                          onChange={(e) =>
                            setBrandingSettings({ ...brandingSettings, marginBottomMm: Number(e.target.value) })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="margin-left">Rand Links (mm)</Label>
                        <Input
                          id="margin-left"
                          type="number"
                          min="10"
                          max="50"
                          value={brandingSettings.marginLeftMm}
                          onChange={(e) =>
                            setBrandingSettings({ ...brandingSettings, marginLeftMm: Number(e.target.value) })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="margin-right">Rand Rechts (mm)</Label>
                        <Input
                          id="margin-right"
                          type="number"
                          min="10"
                          max="50"
                          value={brandingSettings.marginRightMm}
                          onChange={(e) =>
                            setBrandingSettings({ ...brandingSettings, marginRightMm: Number(e.target.value) })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Vorschau und Aktionen */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Vorschau & Test</h3>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Vorschau anzeigen
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Test-PDF erstellen
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button onClick={() => handleSaveSettings("branding")}>
                      <Save className="h-4 w-4 mr-2" />
                      Briefkopf speichern
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

            <TabsContent value="microsoft365" className="space-y-6">
              <Microsoft365Setup />
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
