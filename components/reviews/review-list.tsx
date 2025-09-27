"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, ThumbsUp, ThumbsDown } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string | null
  review_type: string
  created_at: string
  reviewer_profile: {
    first_name: string
    last_name: string
    company_name: string | null
  }
  job: {
    title: string
  }
  helpful_votes: number
  not_helpful_votes: number
  user_vote: "helpful" | "not_helpful" | null
  response: {
    response_text: string
    created_at: string
  } | null
}

interface ReviewListProps {
  userId: string
  showJobTitle?: boolean
  limit?: number
}

export function ReviewList({ userId, showJobTitle = false, limit }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    getCurrentUser()
    fetchReviews()
  }, [userId])

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      setCurrentUserId(user.id)
    }
  }

  const fetchReviews = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from("reviews")
        .select(
          `
          id,
          rating,
          title,
          comment,
          review_type,
          created_at,
          reviewer_profile:reviewer_id (
            first_name,
            last_name,
            company_name
          ),
          job:job_id (
            title
          ),
          review_responses!review_responses_review_id_fkey (
            response_text,
            created_at
          )
        `,
        )
        .eq("reviewee_id", userId)
        .eq("is_public", true)
        .order("created_at", { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) throw error

      // Get vote counts and user votes for each review
      const reviewsWithVotes = await Promise.all(
        (data || []).map(async (review) => {
          // Get vote counts
          const { data: votes } = await supabase.from("review_votes").select("is_helpful").eq("review_id", review.id)

          const helpfulVotes = votes?.filter((v) => v.is_helpful).length || 0
          const notHelpfulVotes = votes?.filter((v) => !v.is_helpful).length || 0

          // Get current user's vote
          let userVote = null
          if (currentUserId) {
            const { data: userVoteData } = await supabase
              .from("review_votes")
              .select("is_helpful")
              .eq("review_id", review.id)
              .eq("voter_id", currentUserId)
              .single()

            if (userVoteData) {
              userVote = userVoteData.is_helpful ? "helpful" : "not_helpful"
            }
          }

          return {
            ...review,
            helpful_votes: helpfulVotes,
            not_helpful_votes: notHelpfulVotes,
            user_vote: userVote,
            response: review.review_responses?.[0] || null,
          }
        }),
      )

      setReviews(reviewsWithVotes)
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (reviewId: string, isHelpful: boolean) => {
    if (!currentUserId) return

    try {
      const { error } = await supabase.from("review_votes").upsert(
        {
          review_id: reviewId,
          voter_id: currentUserId,
          is_helpful: isHelpful,
        },
        {
          onConflict: "review_id,voter_id",
        },
      )

      if (error) throw error
      fetchReviews() // Refresh to get updated vote counts
    } catch (error) {
      console.error("Error voting on review:", error)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn("h-4 w-4", star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300")}
          />
        ))}
      </div>
    )
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Noch keine Bewertungen vorhanden</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>
                    {getInitials(review.reviewer_profile.first_name, review.reviewer_profile.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">
                      {review.reviewer_profile.company_name ||
                        `${review.reviewer_profile.first_name} ${review.reviewer_profile.last_name}`}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {review.review_type === "customer_to_handwerker" ? "Kunde" : "Handwerker"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(review.rating)}
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), {
                        addSuffix: true,
                        locale: de,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {showJobTitle && review.job && <p className="text-sm text-muted-foreground">Auftrag: {review.job.title}</p>}

            {review.title && <h5 className="font-medium mt-2">{review.title}</h5>}
          </CardHeader>

          {review.comment && (
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{review.comment}</p>

              {/* Vote buttons */}
              {currentUserId && currentUserId !== review.reviewer_profile.first_name && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">War diese Bewertung hilfreich?</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={review.user_vote === "helpful" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleVote(review.id, true)}
                      className="h-8"
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      {review.helpful_votes}
                    </Button>
                    <Button
                      variant={review.user_vote === "not_helpful" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleVote(review.id, false)}
                      className="h-8"
                    >
                      <ThumbsDown className="h-3 w-3 mr-1" />
                      {review.not_helpful_votes}
                    </Button>
                  </div>
                </div>
              )}

              {/* Response */}
              {review.response && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">Antwort vom Anbieter</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.response.created_at), {
                        addSuffix: true,
                        locale: de,
                      })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{review.response.response_text}</p>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}
