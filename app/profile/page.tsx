import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { ProfileForm } from "@/components/profile/profile-form"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile with related data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, handwerker_profiles(*), kunde_profiles(*)")
    .eq("id", user.id)
    .single()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <Header />

        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Mein Profil</h1>
            <p className="text-muted-foreground">Verwalten Sie Ihre persönlichen Informationen und Einstellungen.</p>
          </div>

          <ProfileForm user={user} profile={profile} />
        </main>
      </div>
    </div>
  )
}
