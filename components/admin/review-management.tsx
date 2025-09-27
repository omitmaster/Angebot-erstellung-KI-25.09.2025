"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Star, Search, Filter, Eye, CheckCircle, XCircle } from "lucide-react"

interface Review {
  id: string
  rating: number
  comment: string
  is_public: boolean
  review_type: string
  created_at: string
  reviewer: {
    first_name: string
    last_name: string
    company_name: string | null
  }
  reviewee: {
    first_name: string
    last_name: string
    company_name: string | null
  }
  jobs: {
    title: string
  }
}

interface ReviewManagementProps {
  currentUser: any
}

export function ReviewManagement({ currentUser }: ReviewManagementProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchReviews()
  }, [visibilityFilter, ratingFilter])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from("reviews")
        .select(`
          *,
          reviewer:reviewer_id (first_name, last_name, company_name),
          reviewee:reviewee_id (first_name, last_name, company_name),
          jobs:job_id (title)
        `)
        .order("created_at", { ascending: false })

      if (visibilityFilter !== "all") {
        query = query.eq("is_public", visibilityFilter === "public")
      }

      if (ratingFilter !== "all") {
        query = query.eq("rating", Number.parseInt(ratingFilter))
      }

      const { data, error } = await query

      if (error) throw error
      setReviews(data || [])
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReviews = reviews.filter(
    (review) =>
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.reviewer?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.reviewer?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.reviewee?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.reviewee?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.jobs?.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleReviewVisibility = async (reviewId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase.from("reviews").update({ is_public: !currentVisibility }).eq("id", reviewId)

      if (error) throw error

      // Refresh reviews
      fetchReviews()
    } catch (error) {
      console.error("Error updating review visibility:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bewertungsverwaltung</h2>
          <p className="text-muted-foreground">Verwalten Sie alle Bewertungen und deren Sichtbarkeit</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Suchen Sie nach Bewertungen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="public">Öffentlich</SelectItem>
            <SelectItem value="private">Privat</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <Star className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Sterne</SelectItem>
            <SelectItem value="5">5 Sterne</SelectItem>
            <SelectItem value="4">4 Sterne</SelectItem>
            <SelectItem value="3">3 Sterne</SelectItem>
            <SelectItem value="2">2 Sterne</SelectItem>
            <SelectItem value="1">1 Stern</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bewertungen ({filteredReviews.length})</CardTitle>
          <CardDescription>Übersicht aller Bewertungen im System</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bewertung</TableHead>
                <TableHead>Von</TableHead>
                <TableHead>Für</TableHead>
                <TableHead>Auftrag</TableHead>
                <TableHead>Sichtbarkeit</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-sm font-medium">({review.rating})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {review.reviewer?.company_name || `${review.reviewer?.first_name} ${review.reviewer?.last_name}`}
                  </TableCell>
                  <TableCell>
                    {review.reviewee?.company_name || `${review.reviewee?.first_name} ${review.reviewee?.last_name}`}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{review.jobs?.title}</TableCell>
                  <TableCell>
                    <Badge variant={review.is_public ? "default" : "secondary"}>
                      {review.is_public ? "Öffentlich" : "Privat"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(review.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedReview(review)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Bewertungsdetails</DialogTitle>
                            <DialogDescription>Vollständige Bewertung und Details</DialogDescription>
                          </DialogHeader>
                          {selectedReview && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                {renderStars(selectedReview.rating)}
                                <Badge variant={selectedReview.is_public ? "default" : "secondary"}>
                                  {selectedReview.is_public ? "Öffentlich" : "Privat"}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Von</label>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedReview.reviewer?.company_name ||
                                      `${selectedReview.reviewer?.first_name} ${selectedReview.reviewer?.last_name}`}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Für</label>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedReview.reviewee?.company_name ||
                                      `${selectedReview.reviewee?.first_name} ${selectedReview.reviewee?.last_name}`}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Auftrag</label>
                                <p className="text-sm text-muted-foreground">{selectedReview.jobs?.title}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Kommentar</label>
                                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                                  {selectedReview.comment}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Erstellt am</label>
                                <p className="text-sm text-muted-foreground">{formatDate(selectedReview.created_at)}</p>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleReviewVisibility(review.id, review.is_public)}
                      >
                        {review.is_public ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredReviews.length === 0 && (
            <div className="text-center py-8">
              <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Keine Bewertungen gefunden.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
