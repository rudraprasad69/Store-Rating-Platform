"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/database"

export function UserProfile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    address: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      if (user) {
        const fullUser = await db.getUserById(user.id)
        if (fullUser) {
          setFormData({
            name: fullUser.name || "",
            email: fullUser.email || "",
            address: fullUser.address || "",
          })
        }
      }
    }
    loadUser()
  }, [user])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError("")
    setMessage("")
    setIsLoading(true)

    try {
      // Check if email already exists (excluding current user)
      const existingUser = await db.getUserByEmail(formData.email)
      if (existingUser && existingUser.id !== user.id) {
        setError("An account with this email already exists")
        return
      }

      // Update user
      await db.updateUser(user.id, formData)
      setMessage("Profile updated successfully!")
      setIsEditing(false)
    } catch (err) {
      setError("An error occurred while updating your profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError("")
    setMessage("")
    setIsLoading(true)

    try {
      // Validate current password
      const currentUser = await db.getUserById(user.id)
      if (!currentUser || currentUser.password !== passwordData.currentPassword) {
        setError("Current password is incorrect")
        return
      }

      // Validate new password
      if (passwordData.newPassword.length < 6) {
        setError("New password must be at least 6 characters long")
        return
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError("New passwords do not match")
        return
      }

      // Update password
      await db.updateUser(user.id, { password: passwordData.newPassword })
      setMessage("Password updated successfully!")
      setIsChangingPassword(false)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (err) {
      setError("An error occurred while updating your password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange2 = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }))
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)} disabled={isLoading}>
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={!isEditing}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={!isEditing}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                disabled={!isEditing}
                rows={3}
                required
              />
            </div>
            {isEditing && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Profile"}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Password Change */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setIsChangingPassword(!isChangingPassword)} disabled={isLoading}>
              {isChangingPassword ? "Cancel" : "Change Password"}
            </Button>
          </div>
        </CardHeader>
        {isChangingPassword && (
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange2("currentPassword", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange2("newPassword", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange2("confirmPassword", e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Messages */}
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
