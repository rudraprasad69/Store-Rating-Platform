"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { StoreOwnerDashboard } from "@/components/store-owner/store-owner-dashboard"

export default function StoreOwnerPage() {
  return (
    <ProtectedRoute allowedRoles={["store_owner"]}>
      <StoreOwnerDashboard />
    </ProtectedRoute>
  )
}
