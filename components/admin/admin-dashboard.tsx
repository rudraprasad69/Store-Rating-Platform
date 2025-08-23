"use client"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LogOut, Users, Store, Star, UserPlus, Plus } from "lucide-react"
import { db } from "@/lib/database"
import { UserManagement } from "./user-management"
import { StoreManagement } from "./store-management"
import { AddUserDialog } from "./add-user-dialog"
import { AddStoreDialog } from "./add-store-dialog"

import { ModeToggle } from "@/components/ui/mode-toggle"

export function AdminDashboard() {
  const { user, logout } = useAuth()
  const [showAddUser, setShowAddUser] = useState(false)
  const [showAddStore, setShowAddStore] = useState(false)
  const stats = db.getStats()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button variant="outline" onClick={logout} className="flex items-center gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{stats.adminUsers} Admin</Badge>
                <Badge variant="outline">{stats.normalUsers} Users</Badge>
                <Badge variant="outline">{stats.storeOwners} Owners</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStores}</div>
              <p className="text-xs text-muted-foreground">Registered businesses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRatings}</div>
              <p className="text-xs text-muted-foreground">Customer reviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="stores">Store Management</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button onClick={() => setShowAddUser(true)} className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
              <Button onClick={() => setShowAddStore(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Store
              </Button>
            </div>
          </div>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage all users, admins, and store owners on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stores">
            <Card>
              <CardHeader>
                <CardTitle>Store Management</CardTitle>
                <CardDescription>Manage all registered stores and their information</CardDescription>
              </CardHeader>
              <CardContent>
                <StoreManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <AddUserDialog open={showAddUser} onOpenChange={setShowAddUser} />
      <AddStoreDialog open={showAddStore} onOpenChange={setShowAddStore} />
    </div>
  )
}
