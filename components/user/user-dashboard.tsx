'use client'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogOut, Store, Star, User, LayoutDashboard } from 'lucide-react'
import { StoreList } from './store-list'
import { UserProfile } from './user-profile'
import { MyRatings } from './my-ratings'
import { UserStats } from './user-stats'
import { RecentRatings } from './recent-ratings'
import { ModeToggle } from '@/components/ui/mode-toggle'

export function UserDashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-lg">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Store Rating Platform</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Button
              variant="outline"
              onClick={logout}
              className="flex items-center gap-2 bg-transparent interactive-btn"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Navigation Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 glow-hover">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="stores" className="flex items-center gap-2 glow-hover">
              <Store className="h-4 w-4" />
              Browse Stores
            </TabsTrigger>
            <TabsTrigger value="my-ratings" className="flex items-center gap-2 glow-hover">
              <Star className="h-4 w-4" />
              My Ratings
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2 glow-hover">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="space-y-6">
              <UserStats />
              <RecentRatings />
              
            </div>
          </TabsContent>

          <TabsContent value="stores">
            <Card className="hover:transform-none hover:shadow-none">
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
            <Card className="hover:transform-none hover:shadow-none">
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
            <Card className="hover:transform-none hover:shadow-none">
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
      </main>
    </div>
  )
}