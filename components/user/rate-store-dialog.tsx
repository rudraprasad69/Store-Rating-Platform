"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Star } from "lucide-react"
import { db } from "@/lib/database"
import { useAuth } from "@/contexts/auth-context"
import type { Store, Rating } from "@/lib/types"

interface RateStoreDialogProps {
  store: Store
  open: boolean
  onOpenChange: (open: boolean) => void
  existingRating?: Rating | null
  onRatingUpdated?: () => void
}

export function RateStoreDialog({ store, open, onOpenChange, existingRating, onRatingUpdated }: RateStoreDialogProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(existingRating?.rating || 0)
  const [comment, setComment] = useState(existingRating?.comment || "")
  const [hoveredRating, setHoveredRating] = useState(0)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError("")
    setIsLoading(true)

    try {
      if (rating === 0) {
        setError("Please select a rating")
        return
      }

      if (existingRating) {
        // Update existing rating
        await db.updateRating(existingRating.id, {
          rating,
          comment: comment.trim() || undefined,
        })
        console.log("Rating updated in DB.")
      } else {
        // Create new rating
        await db.createRating({
          userId: user.id,
          storeId: store.id,
          rating,
          comment: comment.trim() || undefined,
        })
        console.log("Rating created in DB.")
      }

      onRatingUpdated?.()
      console.log("onRatingUpdated called.")
      onOpenChange(false)
      console.log("Dialog closed.")
      // Reset form
      setRating(0)
      setComment("")
    } catch (err) {
      setError("An error occurred while submitting your rating")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStarClick = (starRating: number) => {
    setRating(starRating)
  }

  const handleStarHover = (starRating: number) => {
    setHoveredRating(starRating)
  }

  const handleStarLeave = () => {
    setHoveredRating(0)
  }

  const displayRating = hoveredRating || rating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{existingRating ? "Update Rating" : "Rate Store"}</DialogTitle>
          <DialogDescription>
            {existingRating ? "Update your rating for" : "Share your experience with"} {store.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= displayRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-200"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-medium">
                  {rating} star{rating !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment (Optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this store..."
              rows={4}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || rating === 0}>
              {isLoading ? "Submitting..." : existingRating ? "Update Rating" : "Submit Rating"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}