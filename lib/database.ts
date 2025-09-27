// Database connection and query utilities
// This would typically use a proper database connection in production

export interface Customer {
  id: string
  name: string
  person?: string
  email?: string
  phone?: string
  address?: string
  source?: string
  tags?: string[]
  created_by: string
  created_at: string
  updated_at: string
}

export interface Intake {
  id: string
  channel: "email" | "whatsapp" | "phone" | "web"
  email_raw?: string
  attachments: any[]
  transcript?: string
  branch?: string
  status: "new" | "analyzed" | "processed" | "archived"
  customer_id?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  customer_id: string
  title: string
  site_address?: string
  status: "planning" | "quoted" | "contracted" | "in_progress" | "completed" | "cancelled"
  clickup_id?: string
  hubspot_id?: string
  folder_url?: string
  created_at: string
  updated_at: string
}

export interface PricebookItem {
  id: string
  branch: string
  code: string
  title: string
  unit: string
  default_qty_formula?: string
  base_minutes: number
  base_material_cost: number
  markup_material_pct: number
  overhead_pct: number
  region_factor: number
  variant_group?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Mock data for development - replace with actual database queries
export const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Müller Bau GmbH",
    person: "Thomas Müller",
    email: "info@mueller-bau.de",
    phone: "+49 40 12345678",
    address: "Musterstraße 123, 20095 Hamburg",
    source: "Website",
    tags: ["Neukunde"],
    created_by: "2",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Schmidt Immobilien",
    person: "Petra Schmidt",
    email: "schmidt@immobilien-gmbh.de",
    phone: "+49 30 87654321",
    address: "Beispielweg 456, 10115 Berlin",
    source: "Empfehlung",
    tags: ["Stammkunde", "Großprojekt"],
    created_by: "2",
    created_at: "2024-01-10T14:30:00Z",
    updated_at: "2024-01-10T14:30:00Z",
  },
]

export const mockIntakes: Intake[] = [
  {
    id: "1",
    channel: "email",
    email_raw: "Guten Tag, wir benötigen ein Angebot für die Sanierung unseres Daches...",
    attachments: [
      { name: "grundriss.pdf", size: 2048000 },
      { name: "fotos.zip", size: 5120000 },
    ],
    transcript: null,
    branch: null,
    status: "new",
    customer_id: "1",
    created_at: "2024-01-20T08:15:00Z",
    updated_at: "2024-01-20T08:15:00Z",
  },
  {
    id: "2",
    channel: "whatsapp",
    email_raw: null,
    attachments: [],
    transcript: "Hallo, ich brauche ein Angebot für mein Badezimmer. Es soll komplett renoviert werden...",
    branch: "Sanitär",
    status: "analyzed",
    customer_id: "2",
    created_at: "2024-01-19T16:45:00Z",
    updated_at: "2024-01-19T17:00:00Z",
  },
]

// Database query functions (mock implementations)
export async function getCustomers(): Promise<Customer[]> {
  return mockCustomers
}

export async function getIntakes(): Promise<Intake[]> {
  return mockIntakes
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  return mockCustomers.find((c) => c.id === id) || null
}

export async function createIntake(intake: Omit<Intake, "id" | "created_at" | "updated_at">): Promise<Intake> {
  const newIntake: Intake = {
    ...intake,
    id: Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  mockIntakes.push(newIntake)
  return newIntake
}
