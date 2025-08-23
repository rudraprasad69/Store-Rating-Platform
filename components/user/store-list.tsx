"use client"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Star, MapPin, Mail, Loader2 } from "lucide-react"
import { db } from "@/lib/database"
import { useAuth } from "@/contexts/auth-context"
import type { Store, Rating } from "@/lib/types"
import { RateStoreDialog } from "./rate-store-dialog"

export function StoreList() {
  const { user } = useAuth()
  const [stores, setStores] = useState<Store[]>([])
  const [userRatings, setUserRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("name")
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)

  const handleRatingUpdated = async () => {
    console.log("handleRatingUpdated called in StoreList.")
    try {
      setLoading(true)
      const [storesData, ratingsData] = await Promise.all([
        db.getStores(),
        user ? db.getRatingsByUserId(user.id) : Promise.resolve([]),
      ])
      setStores(storesData)
      console.log("Stores data updated.", storesData)
      setUserRatings(ratingsData)
      console.log("User ratings updated.", ratingsData)
    } catch (error) {
      console.error("[v0] Error loading stores:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [storesData, ratingsData] = await Promise.all([
          db.getStores(),
          user ? db.getRatingsByUserId(user.id) : Promise.resolve([]),
        ])
        setStores(storesData)
        setUserRatings(ratingsData)
      } catch (error) {
        console.error("[v0] Error loading stores:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const filteredAndSortedStores = useMemo(() => {
    const filtered = stores.filter((store) => {
      const matchesSearch =
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })

    // Sort stores
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "rating":
          return b.averageRating - a.averageRating
        case "reviews":
          return b.totalRatings - a.totalRatings
        default:
          return 0
      }
    })

    return filtered
  }, [stores, searchTerm, sortBy])

  const renderStarRating = (rating: number, totalRatings: number) => {
    if (totalRatings === 0) {
      return (
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-4 w-4 text-gray-300" />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">No ratings yet</span>
        </div>
      )
    }

    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    return (
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= fullStars
                  ? "fill-yellow-400 text-yellow-400"
                  : star === fullStars + 1 && hasHalfStar
                    ? "fill-yellow-200 text-yellow-400"
                    : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">({totalRatings} reviews)</span>
      </div>
    )
  }

  const getUserRatingForStore = (storeId: string) => {
    if (!user) return null
    return userRatings.find((rating) => rating.storeId === storeId) || null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading stores...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search stores by name or location..."
            value={searchTerm || ""}
            onChange={(e) => setSearchTerm(e.target.value || "")}
            className="pl-10"
          />
        </div>
        <Select value={sortBy || "name"} onValueChange={(value) => setSortBy(value || "name")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="reviews">Most Reviews</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedStores.map((store, index) => {
          const userRating = getUserRatingForStore(store.id)
          return (
            <Card key={store.id} className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xl font-bold">{store.name}</CardTitle>
                  {userRating && (
                    <Badge variant="secondary" className="whitespace-nowrap bg-green-100 text-green-800">
                      You rated: {userRating.rating} ★
                    </Badge>
                  )}
                </div>
                <CardDescription className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {store.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{store.address}</span>
                </div>
                <div className="pt-2">{renderStarRating(store.averageRating, store.totalRatings)}</div>
              </CardContent>
              <div className="p-4 pt-0">
                <Button
                  onClick={() => setSelectedStore(store)}
                  className="w-full font-semibold"
                  variant={userRating ? "outline" : "default"}
                >
                  {userRating ? "Update Your Rating" : "Rate This Store"}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {filteredAndSortedStores.length === 0 && (
        <div className="text-center py-12">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No stores found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Rate Store Dialog */}
      {selectedStore && (
        <RateStoreDialog
          store={selectedStore}
          open={!!selectedStore}
          onOpenChange={() => setSelectedStore(null)}
          existingRating={getUserRatingForStore(selectedStore.id)}
          onRatingUpdated={handleRatingUpdated}
        />
      )}
    </div>
  )
}