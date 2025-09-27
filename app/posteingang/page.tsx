import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PosteingangList } from "@/components/posteingang/posteingang-list"
import { PosteingangHeader } from "@/components/posteingang/posteingang-header"

export default async function PosteingangPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get all intakes (incoming requests) for the current user
  const { data: intakes, error: intakesError } = await supabase
    .from("intakes")
    .select(`
      *,
      customer:customers(*)
    `)
    .order("created_at", { ascending: false })

  if (intakesError) {
    console.error("Error fetching intakes:", intakesError)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <PosteingangHeader />
      <PosteingangList intakes={intakes || []} />
    </div>
  )
}
