import { createClient } from "@/lib/supabase/server"
import { NotFoundError } from "@/lib/errors"

export interface Project {
  id: string
  customer_id: string
  title: string
  site_address: string
  status: "draft" | "active" | "completed" | "cancelled"
  clickup_id?: string
  hubspot_id?: string
  folder_url?: string
  created_at: string
  updated_at: string
  customers?: Customer
  offers?: Offer[]
  materials?: Material[]
  files?: File[]
}

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

export interface Offer {
  id: string
  project_id: string
  version: number
  status: "draft" | "sent" | "viewed" | "accepted" | "rejected"
  total: number
  currency: string
  subtotal_labor: number
  subtotal_material: number
  risk_pct: number
  discount_pct: number
  pdf_url?: string
  gaeb_url?: string
  excel_url?: string
  sent_at?: string
  viewed_at?: string
  decided_at?: string
  created_at: string
  updated_at: string
  offer_positions?: OfferPosition[]
}

export interface OfferPosition {
  id: string
  offer_id: string
  item_ref?: string
  description: string
  qty: number
  unit: string
  minutes: number
  labor_rate: number
  material_cost: number
  margin_pct: number
  risk_pct: number
  total: number
  created_at: string
  updated_at: string
}

export interface Material {
  id: string
  project_id: string
  title: string
  sku?: string
  supplier?: string
  qty: number
  unit: string
  price_estimate: number
  status: "planned" | "ordered" | "delivered" | "installed"
  created_at: string
  updated_at: string
}

export class ProjectService {
  static async getProjects(
    userId: string,
    filters?: {
      status?: string
      limit?: number
      offset?: number
    },
  ): Promise<{ projects: Project[]; total: number }> {
    const supabase = await createClient()

    let query = supabase.from("projects").select(
      `
        *,
        customers(*),
        offers(count),
        materials(count)
      `,
      { count: "exact" },
    )

    if (filters?.status) {
      query = query.eq("status", filters.status)
    }

    if (filters?.limit) {
      query = query.range(filters.offset || 0, (filters.offset || 0) + filters.limit - 1)
    }

    query = query.order("created_at", { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    return {
      projects: data || [],
      total: count || 0,
    }
  }

  static async getProject(projectId: string, userId: string): Promise<Project> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        customers(*),
        offers(*),
        materials(*),
        files(*)
      `)
      .eq("id", projectId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        throw new NotFoundError("Projekt nicht gefunden")
      }
      throw error
    }

    return data
  }

  static async createProject(projectData: {
    title: string
    site_address: string
    customer_id: string
  }): Promise<Project> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("projects")
      .insert({
        ...projectData,
        status: "draft",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  static async updateProject(projectId: string, updates: Partial<Project>, userId: string): Promise<Project> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("projects")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  static async deleteProject(projectId: string, userId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase.from("projects").delete().eq("id", projectId)

    if (error) {
      throw error
    }
  }
}

export class CustomerService {
  static async getCustomers(userId: string): Promise<Customer[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("created_by", userId)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  }

  static async createCustomer(
    customerData: Omit<Customer, "id" | "created_at" | "updated_at">,
    userId: string,
  ): Promise<Customer> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("customers")
      .insert({
        ...customerData,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  static async updateCustomer(customerId: string, updates: Partial<Customer>, userId: string): Promise<Customer> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("customers")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId)
      .eq("created_by", userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }
}

export class OfferService {
  static async createOffer(offerData: {
    project_id: string
    positions: Omit<OfferPosition, "id" | "offer_id" | "created_at" | "updated_at">[]
  }): Promise<Offer> {
    const supabase = await createClient()

    // Calculate totals
    const subtotal_labor = offerData.positions.reduce((sum, pos) => sum + (pos.minutes / 60) * pos.labor_rate, 0)
    const subtotal_material = offerData.positions.reduce((sum, pos) => sum + pos.material_cost * pos.qty, 0)
    const total = subtotal_labor + subtotal_material

    const { data: offer, error: offerError } = await supabase
      .from("offers")
      .insert({
        project_id: offerData.project_id,
        version: 1,
        status: "draft",
        total,
        currency: "EUR",
        subtotal_labor,
        subtotal_material,
        risk_pct: 10,
        discount_pct: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (offerError) {
      throw offerError
    }

    // Insert positions
    const positions = offerData.positions.map((pos) => ({
      ...pos,
      offer_id: offer.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    const { error: positionsError } = await supabase.from("offer_positions").insert(positions)

    if (positionsError) {
      throw positionsError
    }

    return offer
  }

  static async getOffers(projectId: string): Promise<Offer[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("offers")
      .select(`
        *,
        offer_positions(*)
      `)
      .eq("project_id", projectId)
      .order("version", { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  }

  static async updateOfferStatus(offerId: string, status: Offer["status"]): Promise<Offer> {
    const supabase = await createClient()

    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === "sent") {
      updates.sent_at = new Date().toISOString()
    } else if (status === "viewed") {
      updates.viewed_at = new Date().toISOString()
    } else if (status === "accepted" || status === "rejected") {
      updates.decided_at = new Date().toISOString()
    }

    const { data, error } = await supabase.from("offers").update(updates).eq("id", offerId).select().single()

    if (error) {
      throw error
    }

    return data
  }
}
