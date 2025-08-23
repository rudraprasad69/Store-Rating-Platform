"use client"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Store, Star, User } from "lucide-react"
import { StoreList } from "./store-list"
import { UserProfile } from "./user-profile"
import { MyRatings } from "./my-ratings"

export function UserDashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Store Rating Platform</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          <Button variant="outline" onClick={logout} className="flex items-center gap-2 bg-transparent">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="p-6">
        {/* Navigation Tabs */}
        <Tabs defaultValue="stores" className="space-y-4">
          <TabsList>
            <TabsTrigger value="stores" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Browse Stores
            </TabsTrigger>
            <TabsTrigger value="my-ratings" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              My Ratings
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stores">
            <Card>
              <CardHeader>
                <CardTitle>Browse Stores</CardTitle>
                <CardDescription>Discover and rate stores in your area</CardDescription>
              </CardHeader>
              <CardContent>
                <StoreList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-ratings">
            <Card>
              <CardHeader>
                <CardTitle>My Ratings</CardTitle>
                <CardDescription>View and manage your store ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <MyRatings />
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
                <UserProfile />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
