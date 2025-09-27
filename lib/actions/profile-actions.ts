"use server"

import { ProfileService } from "@/lib/database/profiles"
import { revalidatePath } from "next/cache"

export async function createUserProfile(
  userId: string,
  profileData: {
    user_type: "handwerker" | "kunde"
    first_name: string
    last_name: string
    phone?: string
    address?: string
    city?: string
    postal_code?: string
    description?: string
    company_name?: string
    website?: string
  },
) {
  try {
    const profile = await ProfileService.createProfile(userId, profileData)
    revalidatePath("/dashboard")
    return { success: true, profile }
  } catch (error) {
    console.error("Failed to create profile:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create profile",
    }
  }
}

export async function updateUserProfile(userId: string, updates: any) {
  try {
    const profile = await ProfileService.updateProfile(userId, updates)
    revalidatePath("/profile")
    revalidatePath("/dashboard")
    return { success: true, profile }
  } catch (error) {
    console.error("Failed to update profile:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile",
    }
  }
}
