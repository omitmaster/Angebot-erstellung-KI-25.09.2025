"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminStats } from "@/components/admin/admin-stats"
import { UserManagement } from "@/components/admin/user-management"
import { JobManagement } from "@/components/admin/job-management"
import { PaymentManagement } from "@/components/admin/payment-management"
import { ReviewManagement } from "@/components/admin/review-management"
import { SystemSettings } from "@/components/admin/system-settings"
import { Shield, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Check if user has admin role
      const { data: adminRole } = await supabase
        .from("admin_roles")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single()

      if (!adminRole) {
        router.push("/dashboard")
        return
      }

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      setCurrentUser({ ...user, profile, adminRole })
      setIsAdmin(true)
    } catch (error) {
      console.error("Error checking admin access:", error)
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">Zugriff verweigert</h2>
            <p className="text-muted-foreground">Sie haben keine Berechtigung für das Admin-Dashboard.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Willkommen, {currentUser?.profile?.first_name} ({currentUser?.adminRole?.role})
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="users">Benutzer</TabsTrigger>
          <TabsTrigger value="jobs">Aufträge</TabsTrigger>
          <TabsTrigger value="payments">Zahlungen</TabsTrigger>
          <TabsTrigger value="reviews">Bewertungen</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AdminStats />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement currentUser={currentUser} />
        </TabsContent>

        <TabsContent value="jobs">
          <JobManagement currentUser={currentUser} />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentManagement currentUser={currentUser} />
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewManagement currentUser={currentUser} />
        </TabsContent>

        <TabsContent value="settings">
          <SystemSettings currentUser={currentUser} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
