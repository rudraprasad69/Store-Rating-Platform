"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { AuthUser } from "@/lib/types"
import { db } from "@/lib/database"

import { mockUsers, mockStores, mockRatings } from "@/lib/mock-data"

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Seed database on first load
    if (!localStorage.getItem("data_seeded")) {
      localStorage.setItem("users", JSON.stringify(mockUsers))
      localStorage.setItem("stores", JSON.stringify(mockStores))
      localStorage.setItem("ratings", JSON.stringify(mockRatings))
      localStorage.setItem("data_seeded", "true")
    }

    // Check for stored auth on mount
    const storedAuth = localStorage.getItem("auth_user")
    if (storedAuth) {
      try {
        const authUser = JSON.parse(storedAuth)
        setUser(authUser)
      } catch (error) {
        localStorage.removeItem("auth_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    const authUser = await db.authenticate(email, password)
    if (authUser) {
      setUser(authUser)
      localStorage.setItem("auth_user", JSON.stringify(authUser))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_user")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
