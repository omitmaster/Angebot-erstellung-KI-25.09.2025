// PDF generation utility for offers
export interface PDFGenerationOptions {
  format?: "A4" | "Letter"
  orientation?: "portrait" | "landscape"
  margins?: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export interface OfferPDFData {
  id: string
  projectTitle: string
  customer: {
    name: string
    person: string
    address: string
    email: string
    phone: string
  }
  projectAddress: string
  offerNumber: string
  date: string
  validUntil: string
  positions: Array<{
    id: string
    code: string
    title: string
    description: string
    quantity: number
    unit: string
    unitPrice: number
    totalPrice: number
    category: string
  }>
  subtotalLabor: number
  subtotalMaterial: number
  riskPercent: number
  discountPercent: number
  total: number
  textBlocks: {
    introduction: string
    advantages: string
    process: string
    terms: string
  }
}

export class PDFGenerator {
  private static companyInfo = {
    name: "Handwerk GmbH",
    address: "Musterstraße 1\n12345 Musterstadt",
    phone: "01234/56789",
    email: "info@handwerk-gmbh.de",
    website: "www.handwerk-gmbh.de",
  }

  static async generateOfferPDF(data: OfferPDFData, options: PDFGenerationOptions = {}): Promise<Blob> {
    // Mock PDF generation - in production, this would use a library like jsPDF or Puppeteer
    console.log("[v0] Generating PDF for offer:", data.offerNumber)
    console.log("[v0] PDF options:", options)

    // Simulate PDF generation process
    const pdfContent = this.generatePDFContent(data)
    console.log("[v0] Generated PDF content length:", pdfContent.length)

    // Return mock PDF blob
    return new Blob([pdfContent], { type: "application/pdf" })
  }

  static async generateExcelExport(data: OfferPDFData): Promise<Blob> {
    console.log("[v0] Generating Excel export for offer:", data.offerNumber)

    // Mock Excel generation
    const excelData = this.generateExcelData(data)
    return new Blob([excelData], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
  }

  static async generateGAEBExport(data: OfferPDFData): Promise<Blob> {
    console.log("[v0] Generating GAEB export for offer:", data.offerNumber)

    // Mock GAEB generation
    const gaebData = this.generateGAEBData(data)
    return new Blob([gaebData], { type: "application/xml" })
  }

  private static generatePDFContent(data: OfferPDFData): string {
    // Mock PDF content generation
    const subtotal = data.positions.reduce((sum, pos) => sum + pos.totalPrice, 0)
    const riskAmount = (subtotal * data.riskPercent) / 100
    const discountAmount = (subtotal * data.discountPercent) / 100
    const netTotal = subtotal + riskAmount - discountAmount
    const vatAmount = netTotal * 0.19
    const grossTotal = netTotal + vatAmount

    return `
ANGEBOT - ${data.offerNumber}

${this.companyInfo.name}
${this.companyInfo.address}
Tel: ${this.companyInfo.phone}
E-Mail: ${this.companyInfo.email}

Kunde: ${data.customer.name}
Ansprechpartner: ${data.customer.person}
${data.customer.address}

Projekt: ${data.projectTitle}
Projektadresse: ${data.projectAddress}
Datum: ${data.date}
Gültig bis: ${data.validUntil}

${data.textBlocks.introduction}

LEISTUNGSVERZEICHNIS:
${data.positions
  .map(
    (pos, index) => `
${pos.code || (index + 1).toString().padStart(2, "0")}. ${pos.title}
    ${pos.description}
    ${pos.quantity} ${pos.unit} × €${pos.unitPrice.toFixed(2)} = €${pos.totalPrice.toFixed(2)}
`,
  )
  .join("")}

PREISÜBERSICHT:
Zwischensumme: €${subtotal.toFixed(2)}
Risikozuschlag (${data.riskPercent}%): €${riskAmount.toFixed(2)}
${data.discountPercent > 0 ? `Rabatt (${data.discountPercent}%): -€${discountAmount.toFixed(2)}` : ""}
Nettosumme: €${netTotal.toFixed(2)}
MwSt. (19%): €${vatAmount.toFixed(2)}
Gesamtsumme: €${grossTotal.toFixed(2)}

${data.textBlocks.advantages}

${data.textBlocks.process}

${data.textBlocks.terms}

Mit freundlichen Grüßen
${this.companyInfo.name}
    `
  }

  private static generateExcelData(data: OfferPDFData): string {
    // Mock Excel data generation
    console.log("[v0] Creating Excel structure for positions:", data.positions.length)
    return `Excel export data for ${data.offerNumber}`
  }

  private static generateGAEBData(data: OfferPDFData): string {
    // Mock GAEB XML generation
    console.log("[v0] Creating GAEB XML structure")
    return `<?xml version="1.0" encoding="UTF-8"?>
<GAEB xmlns="http://www.gaeb.de/GAEB_DA_XML/200407">
  <GAEBInfo>
    <Version>3.2</Version>
    <Date>${data.date}</Date>
  </GAEBInfo>
  <Award>
    <BoQ>
      <BoQInfo>
        <Name>${data.projectTitle}</Name>
        <Description>${data.projectTitle}</Description>
      </BoQInfo>
      ${data.positions
        .map(
          (pos) => `
      <BoQBody>
        <Itemlist>
          <Item>
            <ItemNumber>${pos.code}</ItemNumber>
            <Description>
              <CompleteText>
                <DetailedText>
                  <Text>${pos.title}</Text>
                  <Text>${pos.description}</Text>
                </DetailedText>
              </CompleteText>
            </Description>
            <Qty>${pos.quantity}</Qty>
            <QU>${pos.unit}</QU>
            <UP>${pos.unitPrice}</UP>
            <IT>${pos.totalPrice}</IT>
          </Item>
        </Itemlist>
      </BoQBody>
      `,
        )
        .join("")}
    </BoQ>
  </Award>
</GAEB>`
  }

  static downloadFile(blob: Blob, filename: string): void {
    console.log("[v0] Downloading file:", filename)
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

// Export utility functions
export const generateOfferPDF = PDFGenerator.generateOfferPDF
export const generateExcelExport = PDFGenerator.generateExcelExport
export const generateGAEBExport = PDFGenerator.generateGAEBExport
export const downloadFile = PDFGenerator.downloadFile
