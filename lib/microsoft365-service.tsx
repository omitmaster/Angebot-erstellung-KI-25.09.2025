// Microsoft 365 Integration Service
// Unterstützt E-Mail-Versand, SharePoint-Dokumentenverwaltung und Teams-Benachrichtigungen

export interface Microsoft365Config {
  isActive: boolean
  tenantId: string
  clientId: string
  clientSecret: string // Verschlüsselt gespeichert
  senderEmail: string
  senderName: string
  sharepointSiteUrl?: string
  documentLibrary: string
  teamsWebhookUrl?: string
  defaultChannel?: string
  lastSync?: string
  syncStatus: "disconnected" | "connected" | "error"
}

export interface EmailMessage {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  isHtml?: boolean
  attachments?: Array<{
    name: string
    content: string | Blob
    contentType: string
  }>
  importance?: "low" | "normal" | "high"
}

export interface SharePointDocument {
  id: string
  name: string
  url: string
  size: number
  createdDate: string
  modifiedDate: string
  createdBy: string
  folder: string
}

export interface TeamsMessage {
  title: string
  text: string
  color?: string
  sections?: Array<{
    title: string
    facts: Array<{
      name: string
      value: string
    }>
  }>
  actions?: Array<{
    type: string
    title: string
    url: string
  }>
}

// Microsoft Graph API Client
class Microsoft365Client {
  private config: Microsoft365Config
  private accessToken?: string
  private tokenExpiry?: Date

  constructor(config: Microsoft365Config) {
    this.config = config
  }

  // OAuth 2.0 Token abrufen
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken
    }

    const tokenUrl = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    })

    try {
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      })

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.statusText}`)
      }

      const data = await response.json()
      this.accessToken = data.access_token
      this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000)

      return this.accessToken
    } catch (error) {
      console.error("Error getting access token:", error)
      throw new Error("Failed to authenticate with Microsoft 365")
    }
  }

  // Graph API Request
  private async graphRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAccessToken()
    const url = `https://graph.microsoft.com/v1.0${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Graph API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  // E-Mail senden
  async sendEmail(message: EmailMessage): Promise<void> {
    const emailData = {
      message: {
        subject: message.subject,
        body: {
          contentType: message.isHtml ? "HTML" : "Text",
          content: message.body,
        },
        toRecipients: message.to.map((email) => ({
          emailAddress: { address: email },
        })),
        ccRecipients: message.cc?.map((email) => ({
          emailAddress: { address: email },
        })),
        bccRecipients: message.bcc?.map((email) => ({
          emailAddress: { address: email },
        })),
        importance: message.importance || "normal",
        attachments: message.attachments?.map((att) => ({
          "@odata.type": "#microsoft.graph.fileAttachment",
          name: att.name,
          contentType: att.contentType,
          contentBytes: typeof att.content === "string" ? btoa(att.content) : btoa(att.content.toString()),
        })),
      },
      saveToSentItems: true,
    }

    await this.graphRequest(`/users/${this.config.senderEmail}/sendMail`, {
      method: "POST",
      body: JSON.stringify(emailData),
    })
  }

  // SharePoint-Dokument hochladen
  async uploadToSharePoint(fileName: string, content: Blob, folder = ""): Promise<SharePointDocument> {
    const sitePath = new URL(this.config.sharepointSiteUrl!).pathname
    const libraryPath = `${sitePath}/Shared Documents/${this.config.documentLibrary}/${folder}`
    const uploadPath = `/sites/${sitePath.split("/")[2]}/drive/root:${libraryPath}/${fileName}:/content`

    const response = await fetch(`https://graph.microsoft.com/v1.0${uploadPath}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${await this.getAccessToken()}`,
        "Content-Type": content.type,
      },
      body: content,
    })

    if (!response.ok) {
      throw new Error(`SharePoint upload failed: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      id: data.id,
      name: data.name,
      url: data.webUrl,
      size: data.size,
      createdDate: data.createdDateTime,
      modifiedDate: data.lastModifiedDateTime,
      createdBy: data.createdBy.user.displayName,
      folder: folder,
    }
  }

  // SharePoint-Dokumente auflisten
  async listSharePointDocuments(folder = ""): Promise<SharePointDocument[]> {
    const sitePath = new URL(this.config.sharepointSiteUrl!).pathname
    const libraryPath = `${sitePath}/Shared Documents/${this.config.documentLibrary}/${folder}`
    const listPath = `/sites/${sitePath.split("/")[2]}/drive/root:${libraryPath}:/children`

    const data = await this.graphRequest(listPath)

    return data.value.map((item: any) => ({
      id: item.id,
      name: item.name,
      url: item.webUrl,
      size: item.size,
      createdDate: item.createdDateTime,
      modifiedDate: item.lastModifiedDateTime,
      createdBy: item.createdBy.user.displayName,
      folder: folder,
    }))
  }

  // Teams-Nachricht senden
  async sendTeamsMessage(message: TeamsMessage): Promise<void> {
    if (!this.config.teamsWebhookUrl) {
      throw new Error("Teams webhook URL not configured")
    }

    const teamsPayload = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      themeColor: message.color || "0076D7",
      summary: message.title,
      sections: [
        {
          activityTitle: message.title,
          activitySubtitle: message.text,
          facts: message.sections?.[0]?.facts || [],
        },
        ...(message.sections?.slice(1) || []),
      ],
      potentialAction: message.actions?.map((action) => ({
        "@type": "OpenUri",
        name: action.title,
        targets: [
          {
            os: "default",
            uri: action.url,
          },
        ],
      })),
    }

    const response = await fetch(this.config.teamsWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(teamsPayload),
    })

    if (!response.ok) {
      throw new Error(`Teams message failed: ${response.statusText}`)
    }
  }

  // Verbindung testen
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.getAccessToken()
      await this.graphRequest("/me")
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

// Service-Funktionen für die Anwendung
export async function sendOfferEmail(
  config: Microsoft365Config,
  customerEmail: string,
  offerData: {
    offerNumber: string
    customerName: string
    projectTitle: string
    total: number
  },
  pdfContent: Blob,
): Promise<void> {
  const client = new Microsoft365Client(config)

  const emailBody = `
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #1e40af;">Ihr Angebot ${offerData.offerNumber}</h2>
      
      <p>Sehr geehrte Damen und Herren,</p>
      
      <p>vielen Dank für Ihr Interesse an unserem Unternehmen. Gerne übersenden wir Ihnen hiermit unser Angebot für das Projekt <strong>"${offerData.projectTitle}"</strong>.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1e40af;">Angebotsdaten im Überblick:</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Angebots-Nr.:</strong> ${offerData.offerNumber}</li>
          <li><strong>Projekt:</strong> ${offerData.projectTitle}</li>
          <li><strong>Gesamtsumme:</strong> €${offerData.total.toLocaleString("de-DE", { minimumFractionDigits: 2 })}</li>
        </ul>
      </div>
      
      <p>Das detaillierte Angebot finden Sie im Anhang als PDF-Datei. Gerne stehen wir Ihnen für Rückfragen zur Verfügung und freuen uns auf Ihre Rückmeldung.</p>
      
      <p>Mit freundlichen Grüßen<br>
      Ihr ${config.senderName}</p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="font-size: 12px; color: #666;">
        Diese E-Mail wurde automatisch generiert von unserem Angebots- & Prozessmeister System.
      </p>
    </body>
    </html>
  `

  await client.sendEmail({
    to: [customerEmail],
    subject: `Angebot ${offerData.offerNumber} - ${offerData.projectTitle}`,
    body: emailBody,
    isHtml: true,
    attachments: [
      {
        name: `Angebot_${offerData.offerNumber}.pdf`,
        content: pdfContent,
        contentType: "application/pdf",
      },
    ],
    importance: "normal",
  })
}

export async function uploadOfferToSharePoint(
  config: Microsoft365Config,
  offerData: {
    offerNumber: string
    customerName: string
    projectTitle: string
  },
  pdfContent: Blob,
): Promise<SharePointDocument> {
  const client = new Microsoft365Client(config)
  const fileName = `Angebot_${offerData.offerNumber}_${offerData.customerName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`
  const folder = `Angebote/${new Date().getFullYear()}`

  return await client.uploadToSharePoint(fileName, pdfContent, folder)
}

export async function notifyTeamsAboutNewOffer(
  config: Microsoft365Config,
  offerData: {
    offerNumber: string
    customerName: string
    projectTitle: string
    total: number
    createdBy: string
  },
): Promise<void> {
  const client = new Microsoft365Client(config)

  await client.sendTeamsMessage({
    title: "Neues Angebot erstellt",
    text: `Ein neues Angebot wurde erfolgreich erstellt und versendet.`,
    color: "28a745",
    sections: [
      {
        title: "Angebotsdaten",
        facts: [
          { name: "Angebots-Nr.", value: offerData.offerNumber },
          { name: "Kunde", value: offerData.customerName },
          { name: "Projekt", value: offerData.projectTitle },
          { name: "Gesamtsumme", value: `€${offerData.total.toLocaleString("de-DE")}` },
          { name: "Erstellt von", value: offerData.createdBy },
          { name: "Datum", value: new Date().toLocaleDateString("de-DE") },
        ],
      },
    ],
    actions: [
      {
        type: "OpenUri",
        title: "Angebot anzeigen",
        url: `${process.env.NEXT_PUBLIC_APP_URL}/offers/${offerData.offerNumber}`,
      },
    ],
  })
}

export async function testMicrosoft365Connection(config: Microsoft365Config): Promise<{
  success: boolean
  error?: string
  details?: {
    authentication: boolean
    email: boolean
    sharepoint: boolean
    teams: boolean
  }
}> {
  const client = new Microsoft365Client(config)
  const details = {
    authentication: false,
    email: false,
    sharepoint: false,
    teams: false,
  }

  try {
    // Test Authentication
    const authResult = await client.testConnection()
    details.authentication = authResult.success

    if (!authResult.success) {
      return { success: false, error: authResult.error, details }
    }

    // Test Email
    try {
      await client.graphRequest(`/users/${config.senderEmail}`)
      details.email = true
    } catch (error) {
      console.warn("Email test failed:", error)
    }

    // Test SharePoint
    if (config.sharepointSiteUrl) {
      try {
        await client.listSharePointDocuments()
        details.sharepoint = true
      } catch (error) {
        console.warn("SharePoint test failed:", error)
      }
    }

    // Test Teams
    if (config.teamsWebhookUrl) {
      try {
        await client.sendTeamsMessage({
          title: "Verbindungstest",
          text: "Microsoft 365 Integration erfolgreich konfiguriert!",
          color: "28a745",
        })
        details.teams = true
      } catch (error) {
        console.warn("Teams test failed:", error)
      }
    }

    return {
      success: details.authentication && details.email,
      details,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details,
    }
  }
}

// Hilfsfunktionen für Konfiguration
export function validateMicrosoft365Config(config: Partial<Microsoft365Config>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!config.tenantId) errors.push("Tenant ID ist erforderlich")
  if (!config.clientId) errors.push("Client ID ist erforderlich")
  if (!config.clientSecret) errors.push("Client Secret ist erforderlich")
  if (!config.senderEmail) errors.push("Absender E-Mail ist erforderlich")
  if (!config.senderName) errors.push("Absender Name ist erforderlich")

  if (config.senderEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.senderEmail)) {
    errors.push("Ungültige E-Mail-Adresse")
  }

  if (config.sharepointSiteUrl && !config.sharepointSiteUrl.startsWith("https://")) {
    errors.push("SharePoint URL muss mit https:// beginnen")
  }

  if (config.teamsWebhookUrl && !config.teamsWebhookUrl.startsWith("https://")) {
    errors.push("Teams Webhook URL muss mit https:// beginnen")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function encryptClientSecret(secret: string): string {
  // In Produktion sollte hier eine echte Verschlüsselung verwendet werden
  // Für Demo-Zwecke verwenden wir Base64
  return btoa(secret)
}

export function decryptClientSecret(encryptedSecret: string): string {
  // In Produktion sollte hier eine echte Entschlüsselung verwendet werden
  try {
    return atob(encryptedSecret)
  } catch {
    return encryptedSecret // Fallback für unverschlüsselte Secrets
  }
}
