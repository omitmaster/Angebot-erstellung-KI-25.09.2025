// Contract generation and management utilities
export interface ContractTemplate {
  id: string
  name: string
  category: "standard" | "wdvs" | "putz" | "maler" | "custom"
  template: string
  paymentTermsTemplate: string
  warrantyPeriod: number
}

export interface ContractData {
  contractNumber: string
  offerData: any
  customerData: any
  projectData: any
  paymentTerms: {
    deposit: number
    milestone1: number
    milestone2: number
    final: number
  }
  startDate: string
  completionDate: string
  warrantyPeriod: number
  specialTerms?: string
}

export class ContractGenerator {
  private static templates: ContractTemplate[] = [
    {
      id: "standard",
      name: "Standard Handwerkervertrag",
      category: "standard",
      template: `WERKVERTRAG

zwischen

{COMPANY_NAME}
{COMPANY_ADDRESS}

- nachfolgend "Auftragnehmer" genannt -

und

{CUSTOMER_NAME}
{CUSTOMER_ADDRESS}

- nachfolgend "Auftraggeber" genannt -

§ 1 Vertragsgegenstand
Der Auftragnehmer verpflichtet sich zur Ausführung folgender Arbeiten:

{PROJECT_DESCRIPTION}

Projektadresse: {PROJECT_ADDRESS}

§ 2 Vergütung
Die Vergütung für die vereinbarten Leistungen beträgt {CONTRACT_AMOUNT} Euro (brutto).

§ 3 Zahlungsbedingungen
{PAYMENT_TERMS}

§ 4 Ausführungszeit
Projektbeginn: {START_DATE}
Fertigstellung: {COMPLETION_DATE}

§ 5 Gewährleistung
Der Auftragnehmer gewährt eine Gewährleistung von {WARRANTY_PERIOD} Jahren auf alle Arbeiten.

{SPECIAL_TERMS}

Ort, Datum: ________________

Auftraggeber: ________________    Auftragnehmer: ________________`,
      paymentTermsTemplate: `Die Vergütung wird wie folgt fällig:
- {DEPOSIT}% Anzahlung bei Auftragserteilung
- {MILESTONE1}% nach {MILESTONE1_DESC}
- {MILESTONE2}% nach {MILESTONE2_DESC}
- {FINAL}% nach vollständiger Fertigstellung`,
      warrantyPeriod: 5,
    },
    {
      id: "wdvs",
      name: "WDVS Spezialvertrag",
      category: "wdvs",
      template: `WERKVERTRAG - WÄRMEDÄMMVERBUNDSYSTEM

zwischen

{COMPANY_NAME}
{COMPANY_ADDRESS}

- nachfolgend "Auftragnehmer" genannt -

und

{CUSTOMER_NAME}
{CUSTOMER_ADDRESS}

- nachfolgend "Auftraggeber" genannt -

§ 1 Vertragsgegenstand
Der Auftragnehmer verpflichtet sich zur fachgerechten Ausführung eines Wärmedämmverbundsystems (WDVS) gemäß den anerkannten Regeln der Technik und den geltenden DIN-Normen.

Leistungsumfang:
{PROJECT_DESCRIPTION}

§ 2 Materialien und Ausführung
- Verwendung von zugelassenen WDVS-Systemen
- Ausführung nach Herstellervorgaben
- Einhaltung der EnEV-Bestimmungen
- Fachgerechte Entsorgung von Altmaterialien

§ 3 Vergütung
Die Vergütung für die vereinbarten Leistungen beträgt {CONTRACT_AMOUNT} Euro (brutto).

§ 4 Zahlungsbedingungen
{PAYMENT_TERMS}

§ 5 Ausführungszeit
Projektbeginn: {START_DATE}
Fertigstellung: {COMPLETION_DATE}

§ 6 Gewährleistung
Der Auftragnehmer gewährt eine Gewährleistung von {WARRANTY_PERIOD} Jahren auf das WDVS-System.

§ 7 Besondere Bestimmungen
- Witterungsabhängige Arbeiten
- Baustelleneinrichtung und -räumung
- Koordination mit anderen Gewerken

{SPECIAL_TERMS}

Ort, Datum: ________________

Auftraggeber: ________________    Auftragnehmer: ________________`,
      paymentTermsTemplate: `Die Vergütung wird wie folgt fällig:
- {DEPOSIT}% Anzahlung bei Auftragserteilung
- {MILESTONE1}% nach Gerüststellung und Untergrundvorbereitung
- {MILESTONE2}% nach Dämmung und Armierung
- {FINAL}% nach Oberputz und Abnahme`,
      warrantyPeriod: 5,
    },
  ]

  static getTemplates(): ContractTemplate[] {
    return this.templates
  }

  static getTemplate(templateId: string): ContractTemplate | null {
    return this.templates.find((t) => t.id === templateId) || null
  }

  static generateContract(templateId: string, contractData: ContractData): string {
    console.log("[v0] Generating contract with template:", templateId)

    const template = this.getTemplate(templateId)
    if (!template) {
      console.error("[v0] Template not found:", templateId)
      return ""
    }

    let contract = template.template
    let paymentTerms = template.paymentTermsTemplate

    // Replace payment terms placeholders
    paymentTerms = paymentTerms
      .replace("{DEPOSIT}", contractData.paymentTerms.deposit.toString())
      .replace("{MILESTONE1}", contractData.paymentTerms.milestone1.toString())
      .replace("{MILESTONE2}", contractData.paymentTerms.milestone2.toString())
      .replace("{FINAL}", contractData.paymentTerms.final.toString())
      .replace("{MILESTONE1_DESC}", this.getMilestoneDescription(templateId, 1))
      .replace("{MILESTONE2_DESC}", this.getMilestoneDescription(templateId, 2))

    // Replace contract placeholders
    contract = contract
      .replace("{COMPANY_NAME}", "Handwerk GmbH")
      .replace("{COMPANY_ADDRESS}", "Musterstraße 1\n12345 Musterstadt")
      .replace("{CUSTOMER_NAME}", contractData.customerData.name)
      .replace("{CUSTOMER_ADDRESS}", contractData.customerData.address)
      .replace("{PROJECT_DESCRIPTION}", contractData.projectData.description)
      .replace("{PROJECT_ADDRESS}", contractData.projectData.address)
      .replace("{CONTRACT_AMOUNT}", contractData.offerData.total.toLocaleString("de-DE", { minimumFractionDigits: 2 }))
      .replace("{PAYMENT_TERMS}", paymentTerms)
      .replace("{START_DATE}", contractData.startDate)
      .replace("{COMPLETION_DATE}", contractData.completionDate)
      .replace("{WARRANTY_PERIOD}", contractData.warrantyPeriod.toString())
      .replace("{SPECIAL_TERMS}", contractData.specialTerms || "")

    console.log("[v0] Contract generated successfully")
    return contract
  }

  private static getMilestoneDescription(templateId: string, milestone: number): string {
    const descriptions: Record<string, Record<number, string>> = {
      standard: {
        1: "Materialbeschaffung",
        2: "Zwischenabnahme",
      },
      wdvs: {
        1: "Gerüststellung und Untergrundvorbereitung",
        2: "Dämmung und Armierung",
      },
    }

    return descriptions[templateId]?.[milestone] || `Meilenstein ${milestone}`
  }

  static generateContractNumber(): string {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, "0")
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")

    return `VTG-${year}-${month}${random}`
  }

  static validateContractData(contractData: ContractData): string[] {
    const errors: string[] = []

    if (!contractData.contractNumber) {
      errors.push("Vertragsnummer fehlt")
    }

    if (!contractData.customerData?.name) {
      errors.push("Kundenname fehlt")
    }

    if (!contractData.projectData?.description) {
      errors.push("Projektbeschreibung fehlt")
    }

    if (!contractData.startDate) {
      errors.push("Startdatum fehlt")
    }

    if (!contractData.completionDate) {
      errors.push("Fertigstellungsdatum fehlt")
    }

    const totalPayment =
      contractData.paymentTerms.deposit +
      contractData.paymentTerms.milestone1 +
      contractData.paymentTerms.milestone2 +
      contractData.paymentTerms.final

    if (Math.abs(totalPayment - 100) > 0.01) {
      errors.push("Zahlungsbedingungen ergeben nicht 100%")
    }

    console.log("[v0] Contract validation completed, errors:", errors.length)
    return errors
  }

  static async generatePDF(contractContent: string, contractNumber: string): Promise<Blob> {
    console.log("[v0] Generating contract PDF for:", contractNumber)

    // Mock PDF generation
    const pdfContent = `CONTRACT PDF CONTENT:\n\n${contractContent}`

    return new Blob([pdfContent], { type: "application/pdf" })
  }
}
