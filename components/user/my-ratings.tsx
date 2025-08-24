"use client"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Search, Star, Edit, Trash2, Calendar } from "lucide-react"
import { db } from "@/lib/database"
import { useAuth } from "@/contexts/auth-context"
import type { Rating, Store } from "@/lib/types"
import { RateStoreDialog } from "./rate-store-dialog"

export function MyRatings() {
  const { user } = useAuth()
  const [ratings, setRatings] = useState<Rating[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  
  const [editRating, setEditRating] = useState<{ rating: Rating; store: Store } | null>(null)
  const [stores, setStores] = useState<Store[]>([])

  useEffect(() => {
    const fetchRatings = async () => {
      if (user) {
        const userRatings = await db.getRatingsByUserId(user.id)
        setRatings(userRatings)
      }
    }
    const fetchStores = async () => {
      const allStores = await db.getStores()
      setStores(allStores)
    }

    fetchRatings()
    fetchStores()
  }, [user])

  const filteredRatings = useMemo(() => {
    return (ratings || [])
      .filter((rating) => {
        const store = stores.find((s) => s.id === rating.storeId)
        if (!store) return false

        const matchesSearch =
          store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (rating.comment && rating.comment.toLowerCase().includes(searchTerm.toLowerCase()))

        return matchesSearch
      })
  }, [ratings, searchTerm, stores])

  const initiateDeleteRating = async (ratingId: string) => {
    console.log("Initiating permanent delete for rating ID:", ratingId)
    const success = await db.deleteRating(ratingId)
    console.log("db.deleteRating success:", success)
    if (success && user) {
      const userRatings = await db.getRatingsByUserId(user.id)
      setRatings(userRatings)
      toast({
        title: "Rating deleted",
        description: "The rating has been permanently deleted.",
      })
      console.log("Ratings re-fetched after permanent delete.", userRatings)
    } else {
      toast({
        title: "Error",
        description: "Failed to delete the rating. Please try again.",
        variant: "destructive",
      })
    }
  }

  

  const handleEditRating = (rating: Rating) => {
    const store = stores.find((s) => s.id === rating.storeId)
    if (store) {
      setEditRating({ rating, store })
    }
  }

  const handleRatingUpdated = async () => {
    if (user) {
      const userRatings = await db.getRatingsByUserId(user.id)
      setRatings(userRatings)
    }
    setEditRating(null)
  }

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-1 font-medium">{rating}</span>
      </div>
    )
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search your ratings by store name or comment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(ratings || []).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Rating Given</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(ratings || []).length > 0
                ? ((ratings || []).reduce((sum, r) => sum + r.rating, 0) / (ratings || []).length).toFixed(1)
                : "0.0"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">With Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(ratings || []).filter((r) => r.comment && r.comment.trim()).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Ratings List */}
      <div className="space-y-4">
        {filteredRatings.map((rating) => {
          const store = stores.find((s) => s.id === rating.storeId)
          if (!store) return null

          return (
            <Card key={rating.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{store.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3" />
                      Rated on {formatDate(rating.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRating(rating)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => initiateDeleteRating(rating.id)}
                      className="flex items-center gap-1 text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>{renderStarRating(rating.rating)}</div>
                  <Badge variant="outline">{store.address}</Badge>
                </div>
                {rating.comment && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{rating.comment}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredRatings.length === 0 && (
        <div className="text-center py-12">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            {(ratings || []).length === 0 ? "No ratings yet" : "No ratings found"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {(ratings || []).length === 0
              ? "Start rating stores to see them here"
              : "Try adjusting your search criteria"}
          </p>
        </div>
      )}

      {/* Edit Rating Dialog */}
      {editRating && (
        <RateStoreDialog
          store={editRating.store}
          open={!!editRating}
          onOpenChange={() => setEditRating(null)}
          existingRating={editRating.rating}
          onRatingUpdated={handleRatingUpdated}
        />
      )}
    </div>
  )
}