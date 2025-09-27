"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: Array<{ rating: number; count: number }>
}

interface ReviewStatsProps {
  userId: string
}

export function ReviewStats({ userId }: ReviewStatsProps) {
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [userId])

  const fetchStats = async () => {
    setLoading(true)
    try {
      // Get average rating and total count
      const { data: avgData } = await supabase.rpc("get_user_average_rating", {
        user_id: userId,
      })

      const { data: countData } = await supabase.rpc("get_user_review_count", {
        user_id: userId,
      })

      // Get rating distribution
      const { data: distributionData } = await supabase.rpc("get_user_rating_distribution", {
        user_id: userId,
      })

      setStats({
        averageRating: avgData || 0,
        totalReviews: countData || 0,
        ratingDistribution: distributionData || [],
      })
    } catch (error) {
      console.error("Error fetching review stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn("h-5 w-5", star <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300")}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bewertungen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-4 bg-muted rounded w-8"></div>
                  <div className="h-2 bg-muted rounded flex-1"></div>
                  <div className="h-4 bg-muted rounded w-8"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bewertungen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Noch keine Bewertungen vorhanden</p>
        </CardContent>
      </Card>
    )
  }

  const maxCount = Math.max(...stats.ratingDistribution.map((d) => d.count))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bewertungen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</div>
          {renderStars(stats.averageRating)}
          <p className="text-sm text-muted-foreground">
            Basierend auf {stats.totalReviews} Bewertung{stats.totalReviews !== 1 ? "en" : ""}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const distribution = stats.ratingDistribution.find((d) => d.rating === rating)
            const count = distribution?.count || 0
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0

            return (
              <div key={rating} className="flex items-center gap-2 text-sm">
                <span className="w-8 text-right">{rating}</span>
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Progress value={percentage} className="flex-1 h-2" />
                <span className="w-8 text-left">{count}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
