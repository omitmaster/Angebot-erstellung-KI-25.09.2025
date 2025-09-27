import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { JobBrowser } from "@/components/jobs/job-browser"
import { JobPostingButton } from "@/components/jobs/job-posting-button"

export default async function JobsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type, first_name, last_name")
    .eq("id", user.id)
    .single()

  const isCustomer = profile?.user_type === "kunde"

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <Header />

        <main className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {isCustomer ? "Handwerker finden" : "Verfügbare Aufträge"}
              </h1>
              <p className="text-muted-foreground">
                {isCustomer
                  ? "Posten Sie Ihr Projekt und erhalten Sie Angebote von qualifizierten Handwerkern"
                  : "Durchsuchen Sie verfügbare Aufträge und bewerben Sie sich"}
              </p>
            </div>
            {isCustomer && <JobPostingButton />}
          </div>

          <JobBrowser userType={profile?.user_type || "kunde"} />
        </main>
      </div>
    </div>
  )
}
