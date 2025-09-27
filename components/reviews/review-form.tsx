"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReviewFormProps {
  jobId: string
  revieweeId: string
  revieweeName: string
  reviewType: "customer_to_handwerker" | "handwerker_to_customer"
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ReviewForm({
  jobId,
  revieweeId,
  revieweeName,
  reviewType,
  open,
  onOpenChange,
  onSuccess,
}: ReviewFormProps) {
  const [formData, setFormData] = useState({
    rating: 0,
    title: "",
    comment: "",
    isPublic: true,
  })
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.rating === 0) {
      setError("Bitte wählen Sie eine Bewertung aus")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Nicht angemeldet")

      const reviewData = {
        job_id: jobId,
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        rating: formData.rating,
        title: formData.title || null,
        comment: formData.comment || null,
        review_type: reviewType,
        is_public: formData.isPublic,
      }

      const { error } = await supabase.from("reviews").insert([reviewData])

      if (error) throw error

      // Reset form
      setFormData({
        rating: 0,
        title: "",
        comment: "",
        isPublic: true,
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ein Fehler ist aufgetreten")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-1 hover:scale-110 transition-transform"
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setFormData({ ...formData, rating: star })}
          >
            <Star
              className={cn(
                "h-8 w-8 transition-colors",
                hoveredRating >= star || formData.rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
              )}
            />
          </button>
        ))}
      </div>
    )
  }

  const getRatingText = (rating: number) => {
    const texts = {
      1: "Sehr schlecht",
      2: "Schlecht",
      3: "Durchschnittlich",
      4: "Gut",
      5: "Ausgezeichnet",
    }
    return texts[rating as keyof typeof texts] || ""
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bewertung abgeben</DialogTitle>
          <DialogDescription>Bewerten Sie {revieweeName} für diesen Auftrag</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Stars */}
          <div className="text-center space-y-2">
            <Label>Ihre Bewertung *</Label>
            {renderStars()}
            {formData.rating > 0 && <p className="text-sm text-muted-foreground">{getRatingText(formData.rating)}</p>}
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Titel (optional)</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Kurze Zusammenfassung Ihrer Erfahrung"
              maxLength={200}
            />
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment">Kommentar (optional)</Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Beschreiben Sie Ihre Erfahrung im Detail..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">{formData.comment.length}/1000 Zeichen</p>
          </div>

          {/* Public/Private Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isPublic" className="text-sm">
              Bewertung öffentlich sichtbar machen
            </Label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading || formData.rating === 0} className="flex-1">
              {isLoading ? "Wird gespeichert..." : "Bewertung abgeben"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
