// WhatsApp integration service for material ordering and communication
export interface WhatsAppMessage {
  id: string
  to: string
  message: string
  timestamp: string
  status: "pending" | "sent" | "delivered" | "read" | "failed"
  type: "material_order" | "follow_up" | "project_update" | "general"
  relatedId?: string // Order ID, Project ID, etc.
}

export interface WhatsAppContact {
  id: string
  name: string
  phone: string
  type: "customer" | "supplier" | "subcontractor"
  lastContact?: string
  isActive: boolean
}

export class WhatsAppService {
  private static apiEndpoint = process.env.WHATSAPP_API_ENDPOINT || "https://api.whatsapp.com/send"
  private static businessPhone = process.env.WHATSAPP_BUSINESS_PHONE || "+49123456789"

  static async sendMaterialOrder(
    supplierPhone: string,
    supplierName: string,
    orderItems: Array<{
      materialName: string
      quantity: number
      unit: string
    }>,
    totalAmount: number,
    orderNumber: string,
    notes?: string,
  ): Promise<WhatsAppMessage> {
    console.log("[v0] Sending WhatsApp material order to:", supplierName)

    const message = this.formatMaterialOrderMessage(orderItems, totalAmount, orderNumber, notes)

    const whatsappMessage: WhatsAppMessage = {
      id: Date.now().toString(),
      to: supplierPhone,
      message,
      timestamp: new Date().toISOString(),
      status: "pending",
      type: "material_order",
      relatedId: orderNumber,
    }

    try {
      const success = await this.sendMessage(supplierPhone, message)
      whatsappMessage.status = success ? "sent" : "failed"

      console.log("[v0] WhatsApp order sent successfully:", success)
      return whatsappMessage
    } catch (error) {
      console.error("[v0] WhatsApp sending failed:", error)
      whatsappMessage.status = "failed"
      return whatsappMessage
    }
  }

  static async sendProjectUpdate(
    customerPhone: string,
    customerName: string,
    projectTitle: string,
    updateMessage: string,
    projectId: string,
  ): Promise<WhatsAppMessage> {
    console.log("[v0] Sending WhatsApp project update to:", customerName)

    const message = this.formatProjectUpdateMessage(customerName, projectTitle, updateMessage)

    const whatsappMessage: WhatsAppMessage = {
      id: Date.now().toString(),
      to: customerPhone,
      message,
      timestamp: new Date().toISOString(),
      status: "pending",
      type: "project_update",
      relatedId: projectId,
    }

    try {
      const success = await this.sendMessage(customerPhone, message)
      whatsappMessage.status = success ? "sent" : "failed"

      console.log("[v0] WhatsApp project update sent successfully:", success)
      return whatsappMessage
    } catch (error) {
      console.error("[v0] WhatsApp sending failed:", error)
      whatsappMessage.status = "failed"
      return whatsappMessage
    }
  }

  static async sendFollowUpMessage(
    customerPhone: string,
    customerName: string,
    offerNumber: string,
    followUpMessage: string,
  ): Promise<WhatsAppMessage> {
    console.log("[v0] Sending WhatsApp follow-up to:", customerName)

    const message = this.formatFollowUpMessage(customerName, offerNumber, followUpMessage)

    const whatsappMessage: WhatsAppMessage = {
      id: Date.now().toString(),
      to: customerPhone,
      message,
      timestamp: new Date().toISOString(),
      status: "pending",
      type: "follow_up",
      relatedId: offerNumber,
    }

    try {
      const success = await this.sendMessage(customerPhone, message)
      whatsappMessage.status = success ? "sent" : "failed"

      console.log("[v0] WhatsApp follow-up sent successfully:", success)
      return whatsappMessage
    } catch (error) {
      console.error("[v0] WhatsApp sending failed:", error)
      whatsappMessage.status = "failed"
      return whatsappMessage
    }
  }

  private static formatMaterialOrderMessage(
    orderItems: Array<{
      materialName: string
      quantity: number
      unit: string
    }>,
    totalAmount: number,
    orderNumber: string,
    notes?: string,
  ): string {
    const itemsList = orderItems.map((item) => `• ${item.materialName}: ${item.quantity} ${item.unit}`).join("\n")

    return `🏗️ *Materialbestellung ${orderNumber}*

Hallo,

wir möchten folgende Materialien bestellen:

${itemsList}

*Geschätzte Gesamtsumme:* €${totalAmount.toFixed(2)}

${notes ? `*Anmerkungen:* ${notes}\n` : ""}
Bitte bestätigen Sie die Verfügbarkeit und den Liefertermin.

Vielen Dank!

Handwerk GmbH
${this.businessPhone}`
  }

  private static formatProjectUpdateMessage(customerName: string, projectTitle: string, updateMessage: string): string {
    return `🏠 *Projekt-Update: ${projectTitle}*

Hallo ${customerName},

${updateMessage}

Bei Fragen stehen wir gerne zur Verfügung.

Mit freundlichen Grüßen
Handwerk GmbH
${this.businessPhone}`
  }

  private static formatFollowUpMessage(customerName: string, offerNumber: string, followUpMessage: string): string {
    return `📋 *Angebot ${offerNumber}*

Hallo ${customerName},

${followUpMessage}

Gerne können wir auch telefonisch oder per WhatsApp alle offenen Fragen klären.

Mit freundlichen Grüßen
Handwerk GmbH
${this.businessPhone}`
  }

  private static async sendMessage(phone: string, message: string): Promise<boolean> {
    console.log("[v0] Sending WhatsApp message to:", phone)
    console.log("[v0] Message content:", message)

    // Mock WhatsApp API call
    try {
      // In production, this would make an actual API call to WhatsApp Business API
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: phone,
          message: message,
        }),
      })

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] WhatsApp API response:", result)

      return true
    } catch (error) {
      console.error("[v0] WhatsApp API call failed:", error)

      // For demo purposes, simulate successful sending
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return true
    }
  }

  static generateWhatsAppLink(phone: string, message: string): string {
    const encodedMessage = encodeURIComponent(message)
    const cleanPhone = phone.replace(/[^\d+]/g, "")

    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
  }

  static openWhatsAppChat(phone: string, message: string): void {
    const link = this.generateWhatsAppLink(phone, message)
    window.open(link, "_blank")
  }

  static getMessageHistory(): WhatsAppMessage[] {
    // Mock message history - in production, this would come from a database
    return [
      {
        id: "1",
        to: "+49401234567",
        message: "Materialbestellung MAT-2024-001 versendet",
        timestamp: "2024-01-20T10:30:00Z",
        status: "delivered",
        type: "material_order",
        relatedId: "MAT-2024-001",
      },
      {
        id: "2",
        to: "+49301234567",
        message: "Projekt-Update für WDVS Sanierung",
        timestamp: "2024-01-21T14:15:00Z",
        status: "read",
        type: "project_update",
        relatedId: "PRJ-2024-001",
      },
    ]
  }

  static getContacts(): WhatsAppContact[] {
    // Mock contacts - in production, this would come from a database
    return [
      {
        id: "1",
        name: "Dämmstoff GmbH",
        phone: "+49401234567",
        type: "supplier",
        lastContact: "2024-01-20",
        isActive: true,
      },
      {
        id: "2",
        name: "Baustoffe Nord",
        phone: "+49409876543",
        type: "supplier",
        lastContact: "2024-01-18",
        isActive: true,
      },
      {
        id: "3",
        name: "Thomas Müller",
        phone: "+49301234567",
        type: "customer",
        lastContact: "2024-01-21",
        isActive: true,
      },
    ]
  }
}
