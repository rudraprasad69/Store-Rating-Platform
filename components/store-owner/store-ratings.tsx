"use client"
import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Star, Calendar, MessageSquare } from "lucide-react"
import { db } from "@/lib/database"
import type { Rating } from "@/lib/types"

interface StoreRatingsProps {
  storeId: string
}

export function StoreRatings({ storeId }: StoreRatingsProps) {
  const [ratings] = useState<Rating[]>(db.getRatingsByStoreId(storeId))
  const [searchTerm, setSearchTerm] = useState("")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  const filteredAndSortedRatings = useMemo(() => {
    const filtered = ratings.filter((rating) => {
      const customer = db.getUserById(rating.userId)
      const matchesSearch =
        (customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (rating.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

      const matchesRating = ratingFilter === "all" || rating.rating.toString() === ratingFilter

      return matchesSearch && matchesRating
    })

    // Sort ratings
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "highest":
          return b.rating - a.rating
        case "lowest":
          return a.rating - b.rating
        default:
          return 0
      }
    })

    return filtered
  }, [ratings, searchTerm, ratingFilter, sortBy])

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
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by customer name or comment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="highest">Highest Rating</SelectItem>
            <SelectItem value="lowest">Lowest Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ratings List */}
      <div className="space-y-4">
        {filteredAndSortedRatings.map((rating) => {
          const customer = db.getUserById(rating.userId)
          return (
            <Card key={rating.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div>{renderStarRating(rating.rating)}</div>
                    <div>
                      <p className="font-medium">{customer?.name || "Anonymous Customer"}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(rating.createdAt)}
                      </div>
                    </div>
                  </div>
                  {rating.comment && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      Comment
                    </Badge>
                  )}
                </div>
                {rating.comment && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">{rating.comment}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredAndSortedRatings.length === 0 && (
        <div className="text-center py-12">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            {ratings.length === 0 ? "No ratings yet" : "No ratings found"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {ratings.length === 0
              ? "Your store hasn't received any ratings yet"
              : "Try adjusting your search or filter criteria"}
          </p>
        </div>
      )}
    </div>
  )
}
