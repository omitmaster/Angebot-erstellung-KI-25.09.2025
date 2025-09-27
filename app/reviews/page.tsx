"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { ReviewList } from "@/components/reviews/review-list"
import { ReviewStats } from "@/components/reviews/review-stats"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ReviewsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        setCurrentUser({ ...user, profile })
      }
    } catch (error) {
      console.error("Error fetching user:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <p>Bitte melden Sie sich an, um Ihre Bewertungen zu sehen.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bewertungen</h1>
        <p className="text-muted-foreground">Verwalten Sie Ihre Bewertungen und sehen Sie Feedback von Kunden</p>
      </div>

      <Tabs defaultValue="received" className="space-y-6">
        <TabsList>
          <TabsTrigger value="received">Erhaltene Bewertungen</TabsTrigger>
          <TabsTrigger value="given">Abgegebene Bewertungen</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Bewertungen über Sie</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReviewList userId={currentUser.id} showJobTitle={true} />
                </CardContent>
              </Card>
            </div>
            <div>
              <ReviewStats userId={currentUser.id} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="given" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ihre abgegebenen Bewertungen</CardTitle>
            </CardHeader>
            <CardContent>
              {/* This would show reviews the current user has given */}
              <div className="text-center py-8 text-muted-foreground">
                <p>Funktion wird in Kürze verfügbar sein</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
