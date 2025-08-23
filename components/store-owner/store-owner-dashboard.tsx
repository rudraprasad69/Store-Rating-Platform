"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LogOut, Star, MessageSquare, TrendingUp, Users } from "lucide-react"
import { db } from "@/lib/database"
import type { Store, Rating } from "@/lib/types"
import { StoreRatings } from "./store-ratings"
import { StoreOwnerProfile } from "./store-owner-profile"

export function StoreOwnerDashboard() {
  const { user, logout } = useAuth()
  const [store, setStore] = useState<Store | null>(null)
  const [ratings, setRatings] = useState<Rating[]>([])

  useEffect(() => {
    if (user?.storeId) {
      const storeData = db.getStoreById(user.storeId)
      const storeRatings = db.getRatingsByStoreId(user.storeId)
      setStore(storeData || null)
      setRatings(storeRatings)
    }
  }, [user])

  const renderStarRating = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= fullStars
                ? "fill-yellow-400 text-yellow-400"
                : star === fullStars + 1 && hasHalfStar
                  ? "fill-yellow-200 text-yellow-400"
                  : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-lg font-semibold">{rating.toFixed(1)}</span>
      </div>
    )
  }

  const getRecentRatings = () => {
    return ratings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
  }

  const getRatingDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratings.forEach((rating) => {
      distribution[rating.rating as keyof typeof distribution]++
    })
    return distribution
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Store Found</h2>
          <p className="text-muted-foreground">You don't have a store associated with your account.</p>
        </div>
      </div>
    )
  }

  const ratingDistribution = getRatingDistribution()
  const recentRatings = getRecentRatings()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{store.name}</h1>
            <p className="text-sm text-muted-foreground">Store Owner Dashboard</p>
          </div>
          <Button variant="outline" onClick={logout} className="flex items-center gap-2 bg-transparent">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="p-6">
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {store.totalRatings > 0 ? (
                  renderStarRating(store.averageRating)
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground">No ratings</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{store.totalRatings}</div>
              <p className="text-xs text-muted-foreground">
                {ratings.filter((r) => r.comment && r.comment.trim()).length} with comments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  ratings.filter((r) => {
                    const ratingDate = new Date(r.createdAt)
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return ratingDate >= weekAgo
                  }).length
                }
              </div>
              <p className="text-xs text-muted-foreground">Reviews this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(ratings.map((r) => r.userId)).size}</div>
              <p className="text-xs text-muted-foreground">Have rated your store</p>
            </CardContent>
          </Card>
        </div>

        {/* Rating Distribution */}
        {store.totalRatings > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
              <CardDescription>Breakdown of ratings by star level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingDistribution[stars as keyof typeof ratingDistribution]
                  const percentage = store.totalRatings > 0 ? (count / store.totalRatings) * 100 : 0
                  return (
                    <div key={stars} className="flex items-center gap-4">
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm font-medium">{stars}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-2 w-20">
                        <span className="text-sm font-medium">{count}</span>
                        <span className="text-xs text-muted-foreground">({percentage.toFixed(0)}%)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Reviews Preview */}
        {recentRatings.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>Latest customer feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRatings.map((rating) => {
                  const customer = db.getUserById(rating.userId)
                  return (
                    <div key={rating.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= rating.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{customer?.name || "Anonymous"}</span>
                          <Badge variant="outline" className="text-xs">
                            {new Date(rating.createdAt).toLocaleDateString()}
                          </Badge>
                        </div>
                        {rating.comment && <p className="text-sm text-muted-foreground">{rating.comment}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Tabs */}
        <Tabs defaultValue="ratings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ratings" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              All Ratings
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ratings">
            <Card>
              <CardHeader>
                <CardTitle>All Store Ratings</CardTitle>
                <CardDescription>Complete list of customer ratings and feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <StoreRatings storeId={store.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              <CardContent>
                <StoreOwnerProfile />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
