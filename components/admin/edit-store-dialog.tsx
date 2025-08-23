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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { db } from "@/lib/database"
import type { Store } from "@/lib/types"

interface EditStoreDialogProps {
  store: Store
  open: boolean
  onOpenChange: (open: boolean) => void
  onStoreUpdated: () => void
}

export function EditStoreDialog({ store, open, onOpenChange, onStoreUpdated }: EditStoreDialogProps) {
  const [formData, setFormData] = useState({
    name: store.name,
    email: store.email,
    address: store.address,
    ownerId: store.ownerId,
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Get store owners for the dropdown
  const storeOwners = db.getUsers().filter((user) => user.role === "store_owner")

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Update store
      db.updateStore(store.id, formData)
      onStoreUpdated()
      onOpenChange(false)
    } catch (err) {
      setError("An error occurred while updating the store")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Store</DialogTitle>
          <DialogDescription>Update store information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Store Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              placeholder="Enter store name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              placeholder="Enter store email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              required
              placeholder="Enter store address"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner">Store Owner</Label>
            <Select value={formData.ownerId} onValueChange={(value) => handleChange("ownerId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select store owner" />
              </SelectTrigger>
              <SelectContent>
                {storeOwners.map((owner) => (
                  <SelectItem key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Store"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
