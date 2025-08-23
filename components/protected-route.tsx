"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ("admin" | "user" | "store_owner")[]
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  allowedRoles = ["admin", "user", "store_owner"],
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(redirectTo)
        return
      }

      if (!allowedRoles.includes(user.role)) {
        // Redirect based on user role
        switch (user.role) {
          case "admin":
            router.push("/admin")
            break
          case "store_owner":
            router.push("/store-owner")
            break
          case "user":
            router.push("/user")
            break
          default:
            router.push("/login")
        }
      }
    }
  }, [user, isLoading, allowedRoles, redirectTo, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
