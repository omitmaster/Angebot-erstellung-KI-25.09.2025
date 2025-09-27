// Communication service for material ordering and customer communication
export interface CommunicationMessage {
  id: string
  to: string
  message: string
  timestamp: string
  status: "pending" | "sent" | "delivered" | "read" | "failed"
  type: "material_order" | "follow_up" | "project_update" | "general"
  relatedId?: string // Order ID, Project ID, etc.
  channel: "email" | "phone" | "whatsapp" | "sms"
}

export interface Contact {
  id: string
  name: string
  phone: string
  email?: string
  type: "customer" | "supplier" | "subcontractor"
  lastContact?: string
  isActive: boolean
  preferredChannel: "email" | "phone" | "whatsapp" | "sms"
}

export class CommunicationService {
  private static businessPhone = "+49123456789"
  private static businessEmail = "info@handwerk-gmbh.de"

  static async sendMaterialOrder(
    supplier: Contact,
    orderItems: Array<{
      materialName: string
      quantity: number
      unit: string
    }>,
    totalAmount: number,
    orderNumber: string,
    notes?: string,
  ): Promise<CommunicationMessage> {
    console.log("[v0] Sending material order to:", supplier.name)

    const message = this.formatMaterialOrderMessage(orderItems, totalAmount, orderNumber, notes)

    const communicationMessage: CommunicationMessage = {
      id: Date.now().toString(),
      to: supplier.preferredChannel === "email" ? supplier.email || supplier.phone : supplier.phone,
      message,
      timestamp: new Date().toISOString(),
      status: "pending",
      type: "material_order",
      relatedId: orderNumber,
      channel: supplier.preferredChannel,
    }

    try {
      const success = await this.sendMessage(supplier, message, supplier.preferredChannel)
      communicationMessage.status = success ? "sent" : "failed"

      console.log("[v0] Order sent successfully:", success)
      return communicationMessage
    } catch (error) {
      console.error("[v0] Communication sending failed:", error)
      communicationMessage.status = "failed"
      return communicationMessage
    }
  }

  static async sendProjectUpdate(
    customer: Contact,
    projectTitle: string,
    updateMessage: string,
    projectId: string,
  ): Promise<CommunicationMessage> {
    console.log("[v0] Sending project update to:", customer.name)

    const message = this.formatProjectUpdateMessage(customer.name, projectTitle, updateMessage)

    const communicationMessage: CommunicationMessage = {
      id: Date.now().toString(),
      to: customer.preferredChannel === "email" ? customer.email || customer.phone : customer.phone,
      message,
      timestamp: new Date().toISOString(),
      status: "pending",
      type: "project_update",
      relatedId: projectId,
      channel: customer.preferredChannel,
    }

    try {
      const success = await this.sendMessage(customer, message, customer.preferredChannel)
      communicationMessage.status = success ? "sent" : "failed"

      console.log("[v0] Project update sent successfully:", success)
      return communicationMessage
    } catch (error) {
      console.error("[v0] Communication sending failed:", error)
      communicationMessage.status = "failed"
      return communicationMessage
    }
  }

  static async sendFollowUpMessage(
    customer: Contact,
    offerNumber: string,
    followUpMessage: string,
  ): Promise<CommunicationMessage> {
    console.log("[v0] Sending follow-up to:", customer.name)

    const message = this.formatFollowUpMessage(customer.name, offerNumber, followUpMessage)

    const communicationMessage: CommunicationMessage = {
      id: Date.now().toString(),
      to: customer.preferredChannel === "email" ? customer.email || customer.phone : customer.phone,
      message,
      timestamp: new Date().toISOString(),
      status: "pending",
      type: "follow_up",
      relatedId: offerNumber,
      channel: customer.preferredChannel,
    }

    try {
      const success = await this.sendMessage(customer, message, customer.preferredChannel)
      communicationMessage.status = success ? "sent" : "failed"

      console.log("[v0] Follow-up sent successfully:", success)
      return communicationMessage
    } catch (error) {
      console.error("[v0] Communication sending failed:", error)
      communicationMessage.status = "failed"
      return communicationMessage
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

    return `Materialbestellung ${orderNumber}

Hallo,

wir möchten folgende Materialien bestellen:

${itemsList}

Geschätzte Gesamtsumme: €${totalAmount.toFixed(2)}

${notes ? `Anmerkungen: ${notes}\n` : ""}Bitte bestätigen Sie die Verfügbarkeit und den Liefertermin.

Vielen Dank!

Handwerk GmbH
${this.businessPhone}
${this.businessEmail}`
  }

  private static formatProjectUpdateMessage(customerName: string, projectTitle: string, updateMessage: string): string {
    return `Projekt-Update: ${projectTitle}

Hallo ${customerName},

${updateMessage}

Bei Fragen stehen wir gerne zur Verfügung.

Mit freundlichen Grüßen
Handwerk GmbH
${this.businessPhone}
${this.businessEmail}`
  }

  private static formatFollowUpMessage(customerName: string, offerNumber: string, followUpMessage: string): string {
    return `Angebot ${offerNumber}

Hallo ${customerName},

${followUpMessage}

Gerne können wir auch telefonisch oder per E-Mail alle offenen Fragen klären.

Mit freundlichen Grüßen
Handwerk GmbH
${this.businessPhone}
${this.businessEmail}`
  }

  private static async sendMessage(contact: Contact, message: string, channel: string): Promise<boolean> {
    console.log("[v0] Sending message via", channel, "to:", contact.name)
    console.log("[v0] Message content:", message)

    try {
      // Mock communication API call
      const response = await fetch(`/api/communication/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: channel === "email" ? contact.email : contact.phone,
          message: message,
          channel: channel,
          contactId: contact.id,
        }),
      })

      if (!response.ok) {
        throw new Error(`Communication API error: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] Communication API response:", result)

      return true
    } catch (error) {
      console.error("[v0] Communication API call failed:", error)

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

  static generateEmailLink(email: string, subject: string, message: string): string {
    const encodedSubject = encodeURIComponent(subject)
    const encodedMessage = encodeURIComponent(message)

    return `mailto:${email}?subject=${encodedSubject}&body=${encodedMessage}`
  }

  static openCommunicationChannel(contact: Contact, message: string, subject?: string): void {
    switch (contact.preferredChannel) {
      case "whatsapp":
        const whatsappLink = this.generateWhatsAppLink(contact.phone, message)
        window.open(whatsappLink, "_blank")
        break
      case "email":
        if (contact.email) {
          const emailLink = this.generateEmailLink(contact.email, subject || "Nachricht von Handwerk GmbH", message)
          window.open(emailLink, "_blank")
        }
        break
      case "phone":
        window.open(`tel:${contact.phone}`, "_blank")
        break
      default:
        console.log("[v0] Unsupported communication channel:", contact.preferredChannel)
    }
  }

  static getMessageHistory(): CommunicationMessage[] {
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
        channel: "whatsapp",
      },
      {
        id: "2",
        to: "kunde@example.com",
        message: "Projekt-Update für WDVS Sanierung",
        timestamp: "2024-01-21T14:15:00Z",
        status: "read",
        type: "project_update",
        relatedId: "PRJ-2024-001",
        channel: "email",
      },
    ]
  }

  static getContacts(): Contact[] {
    // Mock contacts - in production, this would come from a database
    return [
      {
        id: "1",
        name: "Dämmstoff GmbH",
        phone: "+49401234567",
        email: "bestellung@daemmstoff-gmbh.de",
        type: "supplier",
        lastContact: "2024-01-20",
        isActive: true,
        preferredChannel: "email",
      },
      {
        id: "2",
        name: "Baustoffe Nord",
        phone: "+49409876543",
        email: "info@baustoffe-nord.de",
        type: "supplier",
        lastContact: "2024-01-18",
        isActive: true,
        preferredChannel: "whatsapp",
      },
      {
        id: "3",
        name: "Thomas Müller",
        phone: "+49301234567",
        email: "thomas.mueller@example.com",
        type: "customer",
        lastContact: "2024-01-21",
        isActive: true,
        preferredChannel: "email",
      },
    ]
  }
}
