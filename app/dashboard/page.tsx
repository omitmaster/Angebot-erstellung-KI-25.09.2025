import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Inbox, FileText, Calculator, TrendingUp, Clock, CheckCircle, Plus } from "lucide-react"
import Link from "next/link"

export default async function Dashboard() {
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
    .select("*, handwerker_profiles(*), kunde_profiles(*)")
    .eq("id", user.id)
    .single()

  const isHandwerker = profile?.user_type === "handwerker"
  const displayName =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : user.email?.split("@")[0] || "Benutzer"

  // Get projects/jobs count
  const { count: projectsCount } = await supabase
    .from(isHandwerker ? "jobs" : "projects")
    .select("*", { count: "exact", head: true })
    .eq(isHandwerker ? "status" : "kunde_id", isHandwerker ? "open" : user.id)

  // Get offers count
  const { count: offersCount } = await supabase
    .from("offers")
    .select("*", { count: "exact", head: true })
    .eq(isHandwerker ? "handwerker_id" : "kunde_id", user.id)

  // Get recent activities
  const { data: recentActivities } = await supabase
    .from("activities")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3)

  // Get pending tasks
  const { data: pendingTasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .order("due_date", { ascending: true })
    .limit(3)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <Header />

        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Willkommen zurück, {displayName}!</h1>
            <p className="text-muted-foreground">
              {isHandwerker
                ? "Hier ist eine Übersicht über Ihre aktuellen Aufträge und Anfragen."
                : "Hier ist eine Übersicht über Ihre Projekte und Handwerker-Suchen."}
            </p>
            <Badge variant={isHandwerker ? "default" : "secondary"} className="mt-2">
              {isHandwerker ? "Handwerker" : "Kunde"}
            </Badge>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {isHandwerker ? "Offene Anfragen" : "Meine Projekte"}
                </CardTitle>
                <Inbox className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projectsCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {projectsCount === 0 ? "Noch keine Projekte" : "Aktuelle Projekte"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {isHandwerker ? "Angebote erstellt" : "Erhaltene Angebote"}
                </CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{offersCount || 0}</div>
                <p className="text-xs text-muted-foreground">{offersCount === 0 ? "Noch keine Angebote" : "Gesamt"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {isHandwerker ? "Umsatz (Monat)" : "Ausgaben (Monat)"}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€0</div>
                <p className="text-xs text-muted-foreground">Noch keine Daten</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{isHandwerker ? "Erfolgsquote" : "Bewertung"}</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isHandwerker ? "-" : "-"}</div>
                <p className="text-xs text-muted-foreground">
                  {isHandwerker ? "Noch keine Aufträge" : "Noch keine Bewertungen"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Aktuelle Aktivitäten</CardTitle>
                <CardDescription>Die neuesten Ereignisse in Ihren Projekten</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivities && recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={activity.id} className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.created_at).toLocaleDateString("de-DE")}
                          </p>
                        </div>
                        <Badge variant="secondary">{activity.type}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">Noch keine Aktivitäten vorhanden</p>
                    <Button asChild>
                      <Link href={isHandwerker ? "/jobs" : "/projects"}>
                        <Plus className="h-4 w-4 mr-2" />
                        {isHandwerker ? "Aufträge suchen" : "Projekt erstellen"}
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Anstehende Aufgaben</CardTitle>
                <CardDescription>Was heute noch zu erledigen ist</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingTasks && pendingTasks.length > 0 ? (
                  <div className="space-y-4">
                    {pendingTasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-4">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Fällig: {new Date(task.due_date).toLocaleDateString("de-DE")}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          Erledigen
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">Keine offenen Aufgaben</p>
                    <p className="text-xs text-muted-foreground">
                      Alle Aufgaben sind erledigt oder es wurden noch keine erstellt.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
