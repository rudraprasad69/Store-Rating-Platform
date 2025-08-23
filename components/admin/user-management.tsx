"use client"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Edit, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { db } from "@/lib/database"
import type { User } from "@/lib/types"
import { EditUserDialog } from "./edit-user-dialog"

type SortField = "name" | "email" | "address" | "role"
type SortDirection = "asc" | "desc"

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]) // Initialize as empty, fetch in useEffect
  const [allStores, setAllStores] = useState<Store[]>([])
  const [allRatings, setAllRatings] = useState<Rating[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  useEffect(() => {
    setUsers(db.getUsers())
    setAllStores(db.getStores())
    setAllRatings(db.getRatings())
  }, [])

  const filteredUsers = useMemo(() => {
    const usersWithRatings = users.map(user => {
      if (user.role === "store_owner") {
        const ownerStores = allStores.filter(store => store.ownerId === user.id);
        let totalRating = 0;
        let ratingCount = 0;

        ownerStores.forEach(store => {
          const storeRatings = allRatings.filter(rating => rating.storeId === store.id);
          storeRatings.forEach(rating => {
            totalRating += rating.rating;
            ratingCount++;
          });
        });

        return {
          ...user,
          averageRating: ratingCount > 0 ? parseFloat((totalRating / ratingCount).toFixed(1)) : 0
        };
      }
      return user;
    });

    const filtered = usersWithRatings.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.address.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole = roleFilter === "all" || user.role === roleFilter

      return matchesSearch && matchesRole
    })

    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      if (typeof aValue === "string") aValue = aValue.toLowerCase()
      if (typeof bValue === "string") bValue = bValue.toLowerCase()

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [users, searchTerm, roleFilter, sortField, sortDirection, allStores, allRatings])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const handleDeleteUser = (userId: string) => {
    const success = db.deleteUser(userId)
    if (success) {
      setUsers(db.getUsers())
      setDeleteUserId(null)
    }
  }

  const handleEditUser = (user: User) => {
    setEditUser(user)
  }

  const handleUserUpdated = () => {
    setUsers(db.getUsers())
    setEditUser(null)
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default"
      case "store_owner":
        return "secondary"
      case "user":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, email, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="store_owner">Store Owner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort("name")}>
                <div className="flex items-center gap-2">
                  Name
                  {getSortIcon("name")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort("email")}>
                <div className="flex items-center gap-2">
                  Email
                  {getSortIcon("email")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort("address")}>
                <div className="flex items-center gap-2">
                  Address
                  {getSortIcon("address")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort("role")}>
                <div className="flex items-center gap-2">
                  Role
                  {getSortIcon("role")}
                </div>
              </TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="max-w-xs truncate">{user.address}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>{user.role.replace("_", " ").toUpperCase()}</Badge>
                </TableCell>
                <TableCell>
                  {user.role === "store_owner" && user.averageRating !== undefined ? (
                    user.averageRating > 0 ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{user.averageRating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <Badge variant="outline">No ratings</Badge>
                    )
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteUserId(user.id)}
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

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No users found matching your criteria.</div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && handleDeleteUser(deleteUserId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit User Dialog */}
      {editUser && (
        <EditUserDialog
          user={editUser}
          open={!!editUser}
          onOpenChange={() => setEditUser(null)}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  )
}
