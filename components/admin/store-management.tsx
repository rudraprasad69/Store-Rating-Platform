"use client"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, Search, Star } from "lucide-react"
import { db } from "@/lib/database"
import type { Store } from "@/lib/types"
import { EditStoreDialog } from "./edit-store-dialog"

export function StoreManagement() {
  const [stores, setStores] = useState<Store[]>(db.getStores())
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteStoreId, setDeleteStoreId] = useState<string | null>(null)
  const [editStore, setEditStore] = useState<Store | null>(null)

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const matchesSearch =
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [stores, searchTerm])

  const handleDeleteStore = (storeId: string) => {
    const success = db.deleteStore(storeId)
    if (success) {
      setStores(db.getStores())
      setDeleteStoreId(null)
    }
  }

  const handleEditStore = (store: Store) => {
    setEditStore(store)
  }

  const handleStoreUpdated = () => {
    setStores(db.getStores())
    setEditStore(null)
  }

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="font-medium">{rating.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by name, email, or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stores Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Total Ratings</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStores.map((store) => (
              <TableRow key={store.id}>
                <TableCell className="font-medium">{store.name}</TableCell>
                <TableCell>{store.email}</TableCell>
                <TableCell className="max-w-xs truncate">{store.address}</TableCell>
                <TableCell>
                  {store.totalRatings > 0 ? (
                    renderStarRating(store.averageRating)
                  ) : (
                    <Badge variant="outline">No ratings</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{store.totalRatings}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditStore(store)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteStoreId(store.id)}
                      className="flex items-center gap-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredStores.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No stores found matching your criteria.</div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteStoreId} onOpenChange={() => setDeleteStoreId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the store and all associated ratings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteStoreId && handleDeleteStore(deleteStoreId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Store Dialog */}
      {editStore && (
        <EditStoreDialog
          store={editStore}
          open={!!editStore}
          onOpenChange={() => setEditStore(null)}
          onStoreUpdated={handleStoreUpdated}
        />
      )}
    </div>
  )
}
