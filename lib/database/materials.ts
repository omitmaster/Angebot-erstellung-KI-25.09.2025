import { createClient } from "@/lib/supabase/server"
import type { Material } from "@/lib/types/material" // Assuming Material is defined in another file

export interface PricebookItem {
  id: string
  code: string
  title: string
  branch: string
  variant_group?: string
  unit: string
  base_minutes: number
  base_material_cost: number
  overhead_pct: number
  markup_material_pct: number
  region_factor: number
  default_qty_formula?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export class MaterialService {
  static async getMaterials(projectId: string): Promise<Material[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  }

  static async createMaterial(materialData: Omit<Material, "id" | "created_at" | "updated_at">): Promise<Material> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("materials")
      .insert({
        ...materialData,
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

  static async updateMaterial(materialId: string, updates: Partial<Material>): Promise<Material> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("materials")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", materialId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  static async deleteMaterial(materialId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase.from("materials").delete().eq("id", materialId)

    if (error) {
      throw error
    }
  }
}

export class PricebookService {
  static async searchItems(query: {
    search?: string
    branch?: string
    limit?: number
    offset?: number
  }): Promise<{ items: PricebookItem[]; total: number }> {
    const supabase = await createClient()

    let dbQuery = supabase.from("pricebook_items").select("*", { count: "exact" }).eq("is_active", true)

    if (query.search) {
      dbQuery = dbQuery.or(`title.ilike.%${query.search}%,code.ilike.%${query.search}%`)
    }

    if (query.branch) {
      dbQuery = dbQuery.eq("branch", query.branch)
    }

    if (query.limit) {
      dbQuery = dbQuery.range(query.offset || 0, (query.offset || 0) + query.limit - 1)
    }

    dbQuery = dbQuery.order("title", { ascending: true })

    const { data, error, count } = await dbQuery

    if (error) {
      throw error
    }

    return {
      items: data || [],
      total: count || 0,
    }
  }

  static async getItem(itemId: string): Promise<PricebookItem | null> {
    const supabase = await createClient()

    const { data, error } = await supabase.from("pricebook_items").select("*").eq("id", itemId).single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      throw error
    }

    return data
  }

  static async calculatePrice(
    itemId: string,
    qty: number,
    regionFactor = 1,
  ): Promise<{
    laborCost: number
    materialCost: number
    total: number
  }> {
    const item = await this.getItem(itemId)
    if (!item) {
      throw new Error("Preisbuch-Artikel nicht gefunden")
    }

    const laborCost = (item.base_minutes / 60) * 65 * qty * regionFactor // 65 EUR/h default rate
    const materialCost = item.base_material_cost * qty * regionFactor * (1 + item.markup_material_pct / 100)
    const overhead = (laborCost + materialCost) * (item.overhead_pct / 100)

    return {
      laborCost,
      materialCost,
      total: laborCost + materialCost + overhead,
    }
  }
}
