// AI Service for analyzing incoming messages and generating responses
// This would integrate with OpenAI GPT-4 in production

export interface AIAnalysisResult {
  branch: string
  confidence: number
  extractedInfo: {
    projectType: string
    size?: string
    scope: string[]
    timeline?: string
    deadline?: string
    nextSteps?: string[]
  }
  missingInfo: string[]
  questions: string[]
  priority: "low" | "medium" | "high"
}

export interface MessageContent {
  subject: string
  content: string
  attachments?: Array<{
    name: string
    type: string
    size: string
  }>
  sender: {
    name: string
    email: string
    company?: string
  }
}

// Mock AI analysis function - replace with actual OpenAI integration
export async function analyzeMessage(message: MessageContent): Promise<AIAnalysisResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Mock analysis based on content keywords
  const content = message.content.toLowerCase()
  const subject = message.subject.toLowerCase()

  let branch = "Allgemein"
  let confidence = 0.7

  // Branch detection logic
  if (content.includes("bad") || content.includes("sanitär") || content.includes("wc") || content.includes("dusche")) {
    branch = "Sanitär"
    confidence = 0.95
  } else if (content.includes("dach") || content.includes("ziegel") || content.includes("dämmung")) {
    branch = "Dach"
    confidence = 0.92
  } else if (content.includes("fassade") || content.includes("wdvs") || content.includes("putz")) {
    branch = "Fassade"
    confidence = 0.88
  } else if (content.includes("maler") || content.includes("streichen") || content.includes("tapete")) {
    branch = "Maler"
    confidence = 0.85
  } else if (content.includes("boden") || content.includes("fliesen") || content.includes("laminat")) {
    branch = "Boden"
    confidence = 0.83
  } else if (content.includes("elektro") || content.includes("steckdose") || content.includes("licht")) {
    branch = "Elektrik"
    confidence = 0.8
  }

  // Extract project information
  const extractedInfo = {
    projectType: inferProjectType(content, subject),
    size: extractSize(content),
    scope: extractScope(content, branch),
    timeline: extractTimeline(content),
    deadline: extractDeadline(content),
  }

  // Generate missing information list
  const missingInfo = generateMissingInfo(content, extractedInfo)

  // Generate follow-up questions
  const questions = generateQuestions(branch, missingInfo, extractedInfo)

  // Determine priority
  const priority = determinePriority(content, subject, extractedInfo)

  return {
    branch,
    confidence,
    extractedInfo,
    missingInfo,
    questions,
    priority,
  }
}

function inferProjectType(content: string, subject: string): string {
  if (content.includes("neubau")) return "Neubau"
  if (content.includes("renovierung") || content.includes("sanierung")) return "Renovierung/Sanierung"
  if (content.includes("umbau")) return "Umbau"
  if (content.includes("reparatur")) return "Reparatur"

  // Infer from subject
  if (subject.includes("bad")) return "Badezimmer Renovierung"
  if (subject.includes("dach")) return "Dachsanierung"
  if (subject.includes("fassade")) return "Fassadensanierung"

  return "Allgemeine Anfrage"
}

function extractSize(content: string): string | undefined {
  const sizeMatches = content.match(/(\d+)\s*(m²|qm|quadratmeter)/i)
  if (sizeMatches) {
    return `${sizeMatches[1]}m²`
  }

  const roomMatches = content.match(/(\d+)\s*(zimmer|räume)/i)
  if (roomMatches) {
    return `${roomMatches[1]} Räume`
  }

  return undefined
}

function extractScope(content: string, branch: string): string[] {
  const scope: string[] = []

  if (branch === "Sanitär") {
    if (content.includes("fliesen")) scope.push("Fliesen erneuern")
    if (content.includes("wc") || content.includes("toilette")) scope.push("WC erneuern")
    if (content.includes("dusche")) scope.push("Dusche erneuern")
    if (content.includes("waschtisch")) scope.push("Waschtisch erneuern")
    if (content.includes("komplett")) scope.push("Komplettumbau")
  } else if (branch === "Dach") {
    if (content.includes("ziegel") || content.includes("eindeckung")) scope.push("Dacheindeckung")
    if (content.includes("dämmung")) scope.push("Dachdämmung")
    if (content.includes("rinne")) scope.push("Dachrinnen")
    if (content.includes("sparren")) scope.push("Dachsparren")
  }

  return scope.length > 0 ? scope : ["Zu klären"]
}

function extractTimeline(content: string): string | undefined {
  if (content.includes("sofort") || content.includes("dringend")) return "Sofort"
  if (content.includes("nächste woche")) return "Nächste Woche"
  if (content.includes("nächsten monat")) return "Nächster Monat"
  if (content.includes("frühjahr")) return "Frühjahr"
  if (content.includes("sommer")) return "Sommer"

  return undefined
}

function extractDeadline(content: string): string | undefined {
  const dateMatches = content.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/g)
  if (dateMatches && dateMatches.length > 0) {
    return `Angebot bis ${dateMatches[0]}`
  }

  return undefined
}

function generateMissingInfo(content: string, extractedInfo: any): string[] {
  const missing: string[] = []

  if (!content.includes("adresse") && !content.includes("straße")) {
    missing.push("Genaue Projektadresse")
  }

  if (!extractedInfo.timeline) {
    missing.push("Gewünschter Zeitrahmen")
  }

  if (!content.includes("budget") && !content.includes("preis")) {
    missing.push("Budget-Vorstellungen")
  }

  if (!extractedInfo.size) {
    missing.push("Genaue Projektgröße")
  }

  return missing
}

function generateQuestions(branch: string, missingInfo: string[], extractedInfo: any): string[] {
  const questions: string[] = []

  // Standard questions based on missing info
  if (missingInfo.includes("Genaue Projektadresse")) {
    questions.push("Können Sie uns die genaue Adresse des Projekts mitteilen?")
  }

  if (missingInfo.includes("Gewünschter Zeitrahmen")) {
    questions.push("Wann soll das Projekt idealerweise durchgeführt werden?")
  }

  if (missingInfo.includes("Budget-Vorstellungen")) {
    questions.push("Haben Sie bereits Budget-Vorstellungen für das Projekt?")
  }

  // Branch-specific questions
  if (branch === "Sanitär") {
    questions.push("Wäre ein Vor-Ort-Termin zur Besichtigung möglich?")
    questions.push("Haben Sie bereits konkrete Vorstellungen zu Sanitärobjekten und Fliesen?")
  } else if (branch === "Dach") {
    questions.push("Können wir einen Termin zur Dachbesichtigung vereinbaren?")
    questions.push("Liegen bereits Gutachten oder Schadensmeldungen vor?")
  }

  return questions
}

function determinePriority(content: string, subject: string, extractedInfo: any): "low" | "medium" | "high" {
  if (content.includes("dringend") || content.includes("sofort") || content.includes("notfall")) {
    return "high"
  }

  if (extractedInfo.deadline || content.includes("ausschreibung")) {
    return "high"
  }

  if (content.includes("größer") || content.includes("neubau") || extractedInfo.size?.includes("m²")) {
    const size = Number.parseInt(extractedInfo.size?.match(/\d+/)?.[0] || "0")
    if (size > 100) return "high"
    if (size > 50) return "medium"
  }

  return "medium"
}

// Generate follow-up email content
export async function generateFollowUpEmail(
  analysis: AIAnalysisResult,
  customerName: string,
  questions: string[],
): Promise<string> {
  const emailTemplate = `
Sehr geehrte/r ${customerName},

vielen Dank für Ihre Anfrage bezüglich ${analysis.extractedInfo.projectType}.

Wir haben Ihre Nachricht analysiert und können Ihnen gerne ein detailliertes Angebot erstellen. 
Dafür benötigen wir noch einige zusätzliche Informationen:

${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Gerne können wir auch einen unverbindlichen Vor-Ort-Termin vereinbaren, um das Projekt 
gemeinsam zu besprechen und alle Details zu klären.

Wir freuen uns auf Ihre Rückmeldung und stehen für Rückfragen jederzeit zur Verfügung.

Mit freundlichen Grüßen
Ihr Handwerk-Team

---
Angebots- & Prozessmeister
E-Mail: angebote@handwerk.de
Telefon: +49 40 123456789
  `.trim()

  return emailTemplate
}
