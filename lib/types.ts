export interface User {
  id: string
  name: string
  email: string
  password: string
  address: string
  role: "admin" | "user" | "store_owner"
  storeId?: string // For store owners
  createdAt: Date
  averageRating?: number // Added this line
}

export interface Store {
  id: string
  name: string
  email: string
  address: string
  ownerId: string
  averageRating: number
  totalRatings: number
  createdAt: Date
}

export interface Rating {
  id: string
  userId: string
  storeId: string
  rating: number // 1-5
  comment?: string
  createdAt: Date
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "store_owner"
  storeId?: string
}
