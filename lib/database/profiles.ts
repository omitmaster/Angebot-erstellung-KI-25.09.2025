import { createClient } from "@/lib/supabase/server"

export interface Profile {
  id: string
  user_type: "handwerker" | "kunde"
  first_name: string
  last_name: string
  company_name?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  website?: string
  description?: string
  profile_image_url?: string
  is_verified: boolean
  created_at: string
  updated_at: string
  handwerker_profiles?: HandwerkerProfile[]
  kunde_profiles?: KundeProfile[]
}

export interface HandwerkerProfile {
  id: string
  trade_category: string
  service_radius_km: number
  license_number?: string
  hourly_rate_min: number
  hourly_rate_max: number
  available_for_emergency: boolean
  insurance_valid_until?: string
  experience_years: number
  rating_average: number
  rating_count: number
  completed_jobs: number
}

export interface KundeProfile {
  id: string
  preferred_contact_method: string
}

export class ProfileService {
  static async getProfile(userId: string): Promise<Profile | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        handwerker_profiles(*),
        kunde_profiles(*)
      `)
      .eq("id", userId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      throw error
    }

    return data
  }

  static async createProfile(userId: string, profileData: Partial<Profile>): Promise<Profile> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Create specific profile based on user type
    if (profileData.user_type === "handwerker") {
      await supabase.from("handwerker_profiles").insert({
        id: userId,
        trade_category: "allgemein",
        service_radius_km: 50,
        hourly_rate_min: 35,
        hourly_rate_max: 65,
        available_for_emergency: false,
        experience_years: 0,
        rating_average: 0,
        rating_count: 0,
        completed_jobs: 0,
      })
    } else {
      await supabase.from("kunde_profiles").insert({
        id: userId,
        preferred_contact_method: "email",
      })
    }

    return data
  }

  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  static async updateHandwerkerProfile(
    userId: string,
    updates: Partial<HandwerkerProfile>,
  ): Promise<HandwerkerProfile> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("handwerker_profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  static async searchHandwerker(filters: {
    tradeCategory?: string
    location?: string
    radius?: number
    minRating?: number
    availableForEmergency?: boolean
  }): Promise<Profile[]> {
    const supabase = await createClient()

    let query = supabase
      .from("profiles")
      .select(`
        *,
        handwerker_profiles(*)
      `)
      .eq("user_type", "handwerker")
      .eq("is_verified", true)

    if (filters.tradeCategory) {
      query = query.eq("handwerker_profiles.trade_category", filters.tradeCategory)
    }

    if (filters.minRating) {
      query = query.gte("handwerker_profiles.rating_average", filters.minRating)
    }

    if (filters.availableForEmergency) {
      query = query.eq("handwerker_profiles.available_for_emergency", true)
    }

    const { data, error } = await query.order("handwerker_profiles.rating_average", { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  }
}
