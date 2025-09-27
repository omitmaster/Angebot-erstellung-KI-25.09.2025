// PDF-Generator für professionelle Angebote mit Briefkopf
// Verwendet die Briefkopf-Einstellungen aus der Datenbank

export interface BrandingSettings {
  isActive: boolean
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  companyWebsite: string
  taxNumber: string
  vatNumber: string
  logoUrl?: string
  letterheadUrl?: string
  logoPosition: "top-left" | "top-center" | "top-right"
  primaryColor: string
  secondaryColor: string
  textColor: string
  fontFamily: string
  fontSizeBody: number
  fontSizeHeading: number
  marginTopMm: number
  marginBottomMm: number
  marginLeftMm: number
  marginRightMm: number
}

export interface OfferData {
  offerNumber: string
  offerDate: string
  validUntil: string
  customer: {
    name: string
    address: string
    email?: string
    phone?: string
  }
  project: {
    title: string
    description: string
    address?: string
  }
  positions: Array<{
    position: number
    description: string
    quantity: number
    unit: string
    unitPrice: number
    totalPrice: number
  }>
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  notes?: string[]
  terms?: string[]
}

// HTML-Template für PDF-Generierung
export function generateOfferHTML(offerData: OfferData, branding: BrandingSettings): string {
  const styles = `
    <style>
      @page {
        margin: ${branding.marginTopMm}mm ${branding.marginRightMm}mm ${branding.marginBottomMm}mm ${branding.marginLeftMm}mm;
        size: A4;
      }
      
      body {
        font-family: ${branding.fontFamily}, sans-serif;
        font-size: ${branding.fontSizeBody}pt;
        color: ${branding.textColor};
        line-height: 1.4;
        margin: 0;
        padding: 0;
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid ${branding.primaryColor};
      }
      
      .logo {
        max-height: 80px;
        max-width: 200px;
      }
      
      .company-info {
        text-align: ${branding.logoPosition === "top-right" ? "left" : "right"};
        font-size: ${branding.fontSizeBody - 1}pt;
        line-height: 1.3;
      }
      
      .company-name {
        font-size: ${branding.fontSizeHeading}pt;
        font-weight: bold;
        color: ${branding.primaryColor};
        margin-bottom: 5px;
      }
      
      .offer-title {
        font-size: ${branding.fontSizeHeading + 4}pt;
        font-weight: bold;
        color: ${branding.primaryColor};
        margin: 30px 0 20px 0;
        text-align: center;
      }
      
      .offer-details {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30px;
      }
      
      .customer-info, .offer-info {
        width: 48%;
      }
      
      .section-title {
        font-size: ${branding.fontSizeBody + 1}pt;
        font-weight: bold;
        color: ${branding.primaryColor};
        margin-bottom: 10px;
        border-bottom: 1px solid ${branding.secondaryColor};
        padding-bottom: 3px;
      }
      
      .positions-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      
      .positions-table th {
        background-color: ${branding.primaryColor};
        color: white;
        padding: 10px 8px;
        text-align: left;
        font-size: ${branding.fontSizeBody}pt;
        font-weight: bold;
      }
      
      .positions-table td {
        padding: 8px;
        border-bottom: 1px solid #ddd;
        vertical-align: top;
      }
      
      .positions-table tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      
      .text-right {
        text-align: right;
      }
      
      .text-center {
        text-align: center;
      }
      
      .totals {
        margin-top: 20px;
        float: right;
        width: 300px;
      }
      
      .totals table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .totals td {
        padding: 5px 10px;
        border-bottom: 1px solid #ddd;
      }
      
      .totals .total-row {
        font-weight: bold;
        background-color: ${branding.primaryColor};
        color: white;
      }
      
      .notes {
        clear: both;
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #ddd;
      }
      
      .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 2px solid ${branding.primaryColor};
        font-size: ${branding.fontSizeBody - 1}pt;
        text-align: center;
        color: #666;
      }
      
      .highlight {
        color: ${branding.primaryColor};
        font-weight: bold;
      }
      
      .currency {
        font-weight: bold;
      }
    </style>
  `

  const headerSection = branding.letterheadUrl
    ? `<div class="header">
         <img src="${branding.letterheadUrl}" alt="Briefkopf" style="width: 100%; max-height: 150px; object-fit: contain;" />
       </div>`
    : `<div class="header">
         ${
           branding.logoPosition === "top-left"
             ? `<div>
                  ${branding.logoUrl ? `<img src="${branding.logoUrl}" alt="Logo" class="logo" />` : ""}
                </div>
                <div class="company-info">
                  <div class="company-name">${branding.companyName}</div>
                  <div>${branding.companyAddress.replace(/\n/g, "<br>")}</div>
                  <div>Tel: ${branding.companyPhone}</div>
                  <div>E-Mail: ${branding.companyEmail}</div>
                  <div>Web: ${branding.companyWebsite}</div>
                </div>`
             : `<div class="company-info">
                  <div class="company-name">${branding.companyName}</div>
                  <div>${branding.companyAddress.replace(/\n/g, "<br>")}</div>
                  <div>Tel: ${branding.companyPhone}</div>
                  <div>E-Mail: ${branding.companyEmail}</div>
                  <div>Web: ${branding.companyWebsite}</div>
                </div>
                <div>
                  ${branding.logoUrl ? `<img src="${branding.logoUrl}" alt="Logo" class="logo" />` : ""}
                </div>`
         }
       </div>`

  const positionsHTML = offerData.positions
    .map(
      (pos) => `
    <tr>
      <td class="text-center">${pos.position}</td>
      <td>${pos.description}</td>
      <td class="text-center">${pos.quantity.toLocaleString("de-DE")}</td>
      <td class="text-center">${pos.unit}</td>
      <td class="text-right currency">€${pos.unitPrice.toLocaleString("de-DE", { minimumFractionDigits: 2 })}</td>
      <td class="text-right currency">€${pos.totalPrice.toLocaleString("de-DE", { minimumFractionDigits: 2 })}</td>
    </tr>
  `,
    )
    .join("")

  const notesHTML = offerData.notes
    ? `<div class="notes">
         <div class="section-title">Hinweise</div>
         <ul>
           ${offerData.notes.map((note) => `<li>${note}</li>`).join("")}
         </ul>
       </div>`
    : ""

  const termsHTML = offerData.terms
    ? `<div class="notes">
         <div class="section-title">Geschäftsbedingungen</div>
         <ul>
           ${offerData.terms.map((term) => `<li>${term}</li>`).join("")}
         </ul>
       </div>`
    : ""

  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Angebot ${offerData.offerNumber}</title>
      ${styles}
    </head>
    <body>
      ${headerSection}
      
      <div class="offer-title">ANGEBOT</div>
      
      <div class="offer-details">
        <div class="customer-info">
          <div class="section-title">Kunde</div>
          <div><strong>${offerData.customer.name}</strong></div>
          <div>${offerData.customer.address.replace(/\n/g, "<br>")}</div>
          ${offerData.customer.email ? `<div>E-Mail: ${offerData.customer.email}</div>` : ""}
          ${offerData.customer.phone ? `<div>Tel: ${offerData.customer.phone}</div>` : ""}
        </div>
        
        <div class="offer-info">
          <div class="section-title">Angebot</div>
          <div><strong>Angebots-Nr.:</strong> ${offerData.offerNumber}</div>
          <div><strong>Datum:</strong> ${offerData.offerDate}</div>
          <div><strong>Gültig bis:</strong> ${offerData.validUntil}</div>
          <div><strong>Projekt:</strong> ${offerData.project.title}</div>
          ${offerData.project.address ? `<div><strong>Objektadresse:</strong> ${offerData.project.address}</div>` : ""}
        </div>
      </div>
      
      <div class="section-title">Projektbeschreibung</div>
      <p>${offerData.project.description}</p>
      
      <div class="section-title">Leistungsverzeichnis</div>
      <table class="positions-table">
        <thead>
          <tr>
            <th style="width: 5%;">Pos.</th>
            <th style="width: 45%;">Beschreibung</th>
            <th style="width: 10%;">Menge</th>
            <th style="width: 10%;">Einheit</th>
            <th style="width: 15%;">Einzelpreis</th>
            <th style="width: 15%;">Gesamtpreis</th>
          </tr>
        </thead>
        <tbody>
          ${positionsHTML}
        </tbody>
      </table>
      
      <div class="totals">
        <table>
          <tr>
            <td>Nettosumme:</td>
            <td class="text-right currency">€${offerData.subtotal.toLocaleString("de-DE", { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td>MwSt. (${offerData.taxRate}%):</td>
            <td class="text-right currency">€${offerData.taxAmount.toLocaleString("de-DE", { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr class="total-row">
            <td><strong>Gesamtsumme:</strong></td>
            <td class="text-right currency"><strong>€${offerData.total.toLocaleString("de-DE", { minimumFractionDigits: 2 })}</strong></td>
          </tr>
        </table>
      </div>
      
      ${notesHTML}
      ${termsHTML}
      
      <div class="footer">
        <div>${branding.companyName} | ${branding.companyPhone} | ${branding.companyEmail}</div>
        <div>Steuernummer: ${branding.taxNumber} | USt-IdNr.: ${branding.vatNumber}</div>
      </div>
    </body>
    </html>
  `
}

// Hilfsfunktion für Standard-Angebotsdaten
export function createDefaultOfferData(): OfferData {
  const today = new Date()
  const validUntil = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 Tage

  return {
    offerNumber: `ANG-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
    offerDate: today.toLocaleDateString("de-DE"),
    validUntil: validUntil.toLocaleDateString("de-DE"),
    customer: {
      name: "Musterkunde GmbH",
      address: "Musterstraße 123\n12345 Musterstadt",
      email: "kunde@beispiel.de",
      phone: "+49 40 987654321",
    },
    project: {
      title: "Beispielprojekt",
      description: "Beschreibung des Projekts mit allen wichtigen Details und Anforderungen.",
      address: "Projektadresse 456\n12345 Projektstadt",
    },
    positions: [
      {
        position: 1,
        description: "Beispielposition 1 - Detaillierte Beschreibung der Leistung",
        quantity: 10,
        unit: "m²",
        unitPrice: 45.0,
        totalPrice: 450.0,
      },
      {
        position: 2,
        description: "Beispielposition 2 - Weitere Leistung mit Materialien",
        quantity: 5,
        unit: "Stk",
        unitPrice: 120.0,
        totalPrice: 600.0,
      },
    ],
    subtotal: 1050.0,
    taxRate: 19,
    taxAmount: 199.5,
    total: 1249.5,
    notes: [
      "Preise verstehen sich zzgl. der gesetzlichen Mehrwertsteuer",
      "Angebot gültig für 30 Tage ab Ausstellungsdatum",
      "Zahlungsziel: 14 Tage netto nach Rechnungsstellung",
    ],
    terms: [
      "Es gelten unsere allgemeinen Geschäftsbedingungen",
      "Änderungen und Zusatzleistungen werden gesondert berechnet",
      "Eigentumsvorbehalte gemäß § 449 BGB",
    ],
  }
}

// PDF-Generierung (Browser-basiert)
export async function generatePDFFromHTML(html: string, filename = "angebot.pdf"): Promise<Blob> {
  // In einer echten Implementierung würde hier eine PDF-Bibliothek wie Puppeteer oder jsPDF verwendet
  // Für die Demo erstellen wir eine HTML-Datei als Blob
  const blob = new Blob([html], { type: "text/html" })
  return blob
}

// Vorschau-URL generieren
export function generatePreviewURL(html: string): string {
  const blob = new Blob([html], { type: "text/html" })
  return URL.createObjectURL(blob)
}

// PDFGenerator object with required methods
export const PDFGenerator = {
  async generateOfferPDF(offerData: any): Promise<Blob> {
    console.log("[v0] Generating PDF for offer:", offerData.offerNumber)

    // Create default branding settings for now
    const defaultBranding: BrandingSettings = {
      isActive: true,
      companyName: "Handwerk GmbH",
      companyAddress: "Musterstraße 1\n12345 Musterstadt",
      companyPhone: "+49 40 123456789",
      companyEmail: "info@handwerk-gmbh.de",
      companyWebsite: "www.handwerk-gmbh.de",
      taxNumber: "123/456/78901",
      vatNumber: "DE123456789",
      logoPosition: "top-left" as const,
      primaryColor: "#2563eb",
      secondaryColor: "#64748b",
      textColor: "#1e293b",
      fontFamily: "Arial",
      fontSizeBody: 10,
      fontSizeHeading: 14,
      marginTopMm: 20,
      marginBottomMm: 20,
      marginLeftMm: 20,
      marginRightMm: 20,
    }

    // Convert the offer data to the expected format
    const convertedOfferData: OfferData = {
      offerNumber: offerData.offerNumber,
      offerDate: offerData.date,
      validUntil: offerData.validUntil,
      customer: {
        name: offerData.customer.name,
        address: offerData.customer.address,
        email: offerData.customer.email,
        phone: offerData.customer.phone,
      },
      project: {
        title: offerData.projectTitle,
        description: offerData.textBlocks?.introduction || "Projektbeschreibung",
        address: offerData.projectAddress,
      },
      positions: offerData.positions.map((pos: any, index: number) => ({
        position: index + 1,
        description: `${pos.title}\n${pos.description}`,
        quantity: pos.quantity,
        unit: pos.unit,
        unitPrice: pos.unitPrice,
        totalPrice: pos.totalPrice,
      })),
      subtotal: offerData.positions.reduce((sum: number, pos: any) => sum + pos.totalPrice, 0),
      taxRate: 19,
      taxAmount: offerData.positions.reduce((sum: number, pos: any) => sum + pos.totalPrice, 0) * 0.19,
      total: offerData.total * 1.19, // Including tax
      notes: offerData.textBlocks?.advantages ? [offerData.textBlocks.advantages] : undefined,
      terms: offerData.textBlocks?.terms ? [offerData.textBlocks.terms] : undefined,
    }

    // Generate HTML and convert to PDF
    const html = generateOfferHTML(convertedOfferData, defaultBranding)
    const pdfBlob = await generatePDFFromHTML(html, `angebot-${offerData.offerNumber}.pdf`)

    console.log("[v0] PDF generation completed")
    return pdfBlob
  },

  async generateExcelExport(offerData: any): Promise<Blob> {
    console.log("[v0] Generating Excel export for offer:", offerData.offerNumber)

    // Create a simple CSV format for Excel compatibility
    const csvContent = [
      // Header row
      ["Position", "Code", "Titel", "Beschreibung", "Menge", "Einheit", "Einzelpreis", "Gesamtpreis", "Kategorie"].join(
        ";",
      ),
      // Data rows
      ...offerData.positions.map((pos: any, index: number) =>
        [
          index + 1,
          pos.code || "",
          pos.title || "",
          pos.description || "",
          pos.quantity,
          pos.unit,
          pos.unitPrice.toFixed(2),
          pos.totalPrice.toFixed(2),
          pos.category || "",
        ].join(";"),
      ),
    ].join("\n")

    // Add BOM for proper UTF-8 encoding in Excel
    const bom = "\uFEFF"
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8" })

    console.log("[v0] Excel export completed")
    return blob
  },

  async generateGAEBExport(offerData: any): Promise<Blob> {
    console.log("[v0] Generating GAEB XML export for offer:", offerData.offerNumber)

    // Create a simplified GAEB XML structure
    const gaebXml = `<?xml version="1.0" encoding="UTF-8"?>
<GAEB xmlns="http://www.gaeb.de/GAEB_DA_XML/200407">
  <GAEBInfo>
    <Version>3.2</Version>
    <Date>${new Date().toISOString().split("T")[0]}</Date>
    <ProgSystem>Handwerk App</ProgSystem>
  </GAEBInfo>
  <PrjInfo>
    <ProjectID>${offerData.offerNumber}</ProjectID>
    <Name>${offerData.projectTitle}</Name>
    <Customer>${offerData.customer.name}</Customer>
    <Date>${offerData.date}</Date>
  </PrjInfo>
  <Award>
    <BoQ>
      ${offerData.positions
        .map(
          (pos: any, index: number) => `
      <Item>
        <ItemNo>${pos.code || (index + 1).toString().padStart(3, "0")}</ItemNo>
        <Description>
          <CompleteText>
            <DetailTxt>
              <Text>${pos.title}</Text>
            </DetailTxt>
            <OutlineText>
              <OutlineTxt>
                <Text>${pos.description}</Text>
              </OutlineTxt>
            </OutlineText>
          </CompleteText>
        </Description>
        <Qty>${pos.quantity}</Qty>
        <QU>${pos.unit}</QU>
        <UP>${pos.unitPrice.toFixed(2)}</UP>
        <TotalPrice>${pos.totalPrice.toFixed(2)}</TotalPrice>
      </Item>`,
        )
        .join("")}
    </BoQ>
    <SummaryTotal>${offerData.total.toFixed(2)}</SummaryTotal>
  </Award>
</GAEB>`

    const blob = new Blob([gaebXml], { type: "application/xml" })

    console.log("[v0] GAEB export completed")
    return blob
  },

  downloadFile(blob: Blob, filename: string): void {
    console.log("[v0] Downloading file:", filename)

    // Create download link and trigger download
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log("[v0] File download initiated")
  },
}
