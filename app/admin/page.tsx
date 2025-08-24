"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "user"]}>
      <AdminDashboard />
    </ProtectedRoute>
  )
}
