import { createClient } from "@/lib/supabase/server"

export interface Settings {
  id: string
  email_from: string
  labor_rate_eur_per_hour: number
  sms_sender_id?: string
  default_risk_pct: number
  default_material_markup_pct: number
  default_overhead_pct: number
  whatsapp_number?: string
  region_factor: Record<string, number>
  feature_clickup: boolean
  feature_hubspot: boolean
  created_at: string
  updated_at: string
}

export class SettingsService {
  static async getSettings(): Promise<Settings | null> {
    const supabase = await createClient()

    const { data, error } = await supabase.from("settings").select("*").limit(1).single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      throw error
    }

    return data
  }

  static async updateSettings(updates: Partial<Settings>): Promise<Settings> {
    const supabase = await createClient()

    // First try to update existing settings
    const { data: existing } = await supabase.from("settings").select("id").limit(1).single()

    if (existing) {
      const { data, error } = await supabase
        .from("settings")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } else {
      // Create new settings if none exist
      const { data, error } = await supabase
        .from("settings")
        .insert({
          ...updates,
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
  }

  static async getDefaultSettings(): Promise<Partial<Settings>> {
    return {
      email_from: "noreply@handwerk-app.de",
      labor_rate_eur_per_hour: 65,
      default_risk_pct: 10,
      default_material_markup_pct: 15,
      default_overhead_pct: 20,
      region_factor: {
        default: 1.0,
        munich: 1.3,
        berlin: 1.2,
        hamburg: 1.15,
        cologne: 1.1,
      },
      feature_clickup: false,
      feature_hubspot: false,
    }
  }
}
