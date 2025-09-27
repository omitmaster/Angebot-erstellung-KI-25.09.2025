// Follow-up automation and notification service
export interface FollowUpRule {
  id: string
  name: string
  triggerDays: number
  method: "email" | "sms" | "phone" | "whatsapp"
  template: string
  isActive: boolean
}

export interface FollowUpSchedule {
  id: string
  offerId: string
  customerId: string
  scheduledDate: string
  method: string
  template: string
  status: "pending" | "sent" | "completed" | "cancelled"
  attempts: number
}

export class FollowUpService {
  private static defaultRules: FollowUpRule[] = [
    {
      id: "1",
      name: "Erste Nachfrage",
      triggerDays: 3,
      method: "email",
      template:
        "Sehr geehrte Damen und Herren,\n\nwir haben Ihnen vor einigen Tagen unser Angebot zugesendet. Haben Sie bereits Gelegenheit gehabt, dieses zu prüfen?\n\nGerne stehen wir für Rückfragen zur Verfügung.",
      isActive: true,
    },
    {
      id: "2",
      name: "Zweite Nachfrage",
      triggerDays: 7,
      method: "phone",
      template: "Telefonische Nachfrage zum Angebot. Interesse prüfen und offene Fragen klären.",
      isActive: true,
    },
    {
      id: "3",
      name: "Finale Nachfrage",
      triggerDays: 14,
      method: "email",
      template:
        "Sehr geehrte Damen und Herren,\n\nda wir bisher keine Rückmeldung zu unserem Angebot erhalten haben, möchten wir nochmals nachfragen.\n\nSollten Sie kein Interesse haben, teilen Sie uns dies gerne mit.",
      isActive: true,
    },
  ]

  static getFollowUpRules(): FollowUpRule[] {
    return this.defaultRules
  }

  static scheduleFollowUp(offerId: string, customerId: string, offerDate: string): FollowUpSchedule[] {
    console.log("[v0] Scheduling follow-ups for offer:", offerId)

    const schedules: FollowUpSchedule[] = []
    const baseDate = new Date(offerDate)

    this.defaultRules.forEach((rule) => {
      if (rule.isActive) {
        const scheduledDate = new Date(baseDate)
        scheduledDate.setDate(scheduledDate.getDate() + rule.triggerDays)

        schedules.push({
          id: `${offerId}-${rule.id}`,
          offerId,
          customerId,
          scheduledDate: scheduledDate.toISOString().split("T")[0],
          method: rule.method,
          template: rule.template,
          status: "pending",
          attempts: 0,
        })
      }
    })

    console.log("[v0] Created follow-up schedules:", schedules.length)
    return schedules
  }

  static async sendFollowUp(schedule: FollowUpSchedule): Promise<boolean> {
    console.log("[v0] Sending follow-up:", schedule.method, "for offer:", schedule.offerId)

    try {
      switch (schedule.method) {
        case "email":
          return await this.sendEmail(schedule)
        case "sms":
          return await this.sendSMS(schedule)
        case "phone":
          return await this.schedulePhoneCall(schedule)
        case "whatsapp":
          return await this.sendWhatsApp(schedule)
        default:
          console.log("[v0] Unknown follow-up method:", schedule.method)
          return false
      }
    } catch (error) {
      console.error("[v0] Follow-up sending failed:", error)
      return false
    }
  }

  private static async sendEmail(schedule: FollowUpSchedule): Promise<boolean> {
    // Mock email sending
    console.log("[v0] Sending email follow-up...")
    console.log("[v0] Email content:", schedule.template)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return true
  }

  private static async sendSMS(schedule: FollowUpSchedule): Promise<boolean> {
    // Mock SMS sending
    console.log("[v0] Sending SMS follow-up...")
    console.log("[v0] SMS content:", schedule.template)

    await new Promise((resolve) => setTimeout(resolve, 500))

    return true
  }

  private static async schedulePhoneCall(schedule: FollowUpSchedule): Promise<boolean> {
    // Mock phone call scheduling
    console.log("[v0] Scheduling phone call follow-up...")
    console.log("[v0] Call notes:", schedule.template)

    return true
  }

  private static async sendWhatsApp(schedule: FollowUpSchedule): Promise<boolean> {
    // Mock WhatsApp sending
    console.log("[v0] Sending WhatsApp follow-up...")
    console.log("[v0] WhatsApp content:", schedule.template)

    await new Promise((resolve) => setTimeout(resolve, 800))

    return true
  }

  static getDueFollowUps(schedules: FollowUpSchedule[]): FollowUpSchedule[] {
    const today = new Date().toISOString().split("T")[0]

    return schedules.filter((schedule) => schedule.status === "pending" && schedule.scheduledDate <= today)
  }

  static updateFollowUpStatus(
    schedules: FollowUpSchedule[],
    scheduleId: string,
    status: "sent" | "completed" | "cancelled",
  ): FollowUpSchedule[] {
    return schedules.map((schedule) =>
      schedule.id === scheduleId ? { ...schedule, status, attempts: schedule.attempts + 1 } : schedule,
    )
  }
}
