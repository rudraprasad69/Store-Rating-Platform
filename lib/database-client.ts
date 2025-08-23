// Database client abstraction layer for PostgreSQL
// This simulates real database operations with proper error handling and types

import type { Store, Rating, User } from "./types"

// Simulated database connection pool
class DatabasePool {
  private static instance: DatabasePool
  private connected = false

  static getInstance(): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool()
    }
    return DatabasePool.instance
  }

  async connect(): Promise<void> {
    // Simulate connection establishment
    this.connected = true
    console.log("[v0] Database connected to PostgreSQL")
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<{ rows: T[]; rowCount: number }> {
    if (!this.connected) {
      await this.connect()
    }

    // Simulate database query execution
    console.log("[v0] Executing SQL:", sql, "with params:", params)

    // For demo purposes, we'll use localStorage as the backend
    // but structure it like real database operations
    return this.executeQuery<T>(sql, params)
  }

  private async executeQuery<T>(sql: string, params: any[]): Promise<{ rows: T[]; rowCount: number }> {
    // Parse SQL and execute against localStorage (simulating PostgreSQL)
    const operation = sql.trim().split(" ")[0].toLowerCase()

    switch (operation) {
      case "select":
        return this.handleSelect<T>(sql, params)
      case "insert":
        return this.handleInsert<T>(sql, params)
      case "update":
        return this.handleUpdate<T>(sql, params)
      case "delete":
        return this.handleDelete<T>(sql, params)
      default:
        throw new Error(`Unsupported SQL operation: ${operation}`)
    }
  }

  private handleSelect<T>(sql: string, params: any[]): { rows: T[]; rowCount: number } {
    // Simulate SELECT operations
    if (sql.includes("FROM users")) {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      if (sql.includes("WHERE id = $1")) {
        const user = users.find((u: User) => u.id === params[0])
        return { rows: user ? [user] as T[] : [], rowCount: user ? 1 : 0 }
      }
      if (sql.includes("WHERE email = $1")) {
        const user = users.find((u: User) => u.email === params[0])
        return { rows: user ? [user] as T[] : [], rowCount: user ? 1 : 0 }
      }
      return { rows: users as T[], rowCount: users.length }
    }
    if (sql.includes("FROM stores")) {
      const stores = JSON.parse(localStorage.getItem("stores") || "[]")
      if (sql.includes("WHERE id = $1")) {
        const store = stores.find((s: Store) => s.id === params[0])
        return { rows: store ? [store] as T[] : [], rowCount: store ? 1 : 0 }
      }
      if (sql.includes("WHERE owner_id = $1")) {
        const store = stores.find((s: Store) => s.storeId === params[0])
        return { rows: store ? [store] as T[] : [], rowCount: store ? 1 : 0 }
      }
      return { rows: stores as T[], rowCount: stores.length }
    }
    if (sql.includes("FROM ratings")) {
      const ratings = JSON.parse(localStorage.getItem("ratings") || "[]")
      if (sql.includes("WHERE user_id = $1 AND store_id = $2")) {
        const rating = ratings.find((r: Rating) => r.userId === params[0] && r.storeId === params[1])
        return { rows: rating ? [rating] as T[] : [], rowCount: rating ? 1 : 0 }
      }
      if (sql.includes("WHERE user_id = $1")) {
        const userRatings = ratings.filter((r: Rating) => r.userId === params[0])
        return { rows: userRatings as T[], rowCount: userRatings.length }
      }
      if (sql.includes("WHERE store_id = $1")) {
        const storeRatings = ratings.filter((r: Rating) => r.storeId === params[0])
        return { rows: storeRatings as T[], rowCount: storeRatings.length }
      }
      return { rows: ratings as T[], rowCount: ratings.length }
    }
    if (sql.includes("store_ratings_view")) {
      // Simulate the view query
      const stores = JSON.parse(localStorage.getItem("stores") || "[]")
      const ratings = JSON.parse(localStorage.getItem("ratings") || "[]")

      const storeStats = stores.map((store: Store) => {
        const storeRatings = ratings.filter((r: Rating) => r.storeId === store.id)
        const avgRating =
          storeRatings.length > 0
            ? storeRatings.reduce((sum: number, r: Rating) => sum + r.rating, 0) / storeRatings.length
            : 0

        return {
          ...store,
          average_rating: avgRating,
          total_ratings: storeRatings.length,
        }
      })

      if (sql.includes("WHERE id = $1")) {
        const store = storeStats.find((s: Store) => s.id === params[0])
        return { rows: store ? [store] as T[] : [], rowCount: store ? 1 : 0 }
      }

      return { rows: storeStats as T[], rowCount: storeStats.length }
    }
    return { rows: [], rowCount: 0 }
  }

  private handleInsert<T>(sql: string, params: any[]): { rows: T[]; rowCount: number } {
    // Simulate INSERT operations
    if (sql.includes("INTO users")) {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const newUser = {
        id: (users.length > 0 ? Math.max(...users.map((u: User) => parseInt(u.id))) + 1 : 1).toString(),
        name: params[0],
        email: params[1],
        password: params[2],
        address: params[3],
        role: params[4] || "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))
      return { rows: [newUser] as T[], rowCount: 1 }
    }
    if (sql.includes("INTO stores")) {
      const stores = JSON.parse(localStorage.getItem("stores") || "[]")
      const newStore = {
        id: (stores.length > 0 ? Math.max(...stores.map((s: Store) => parseInt(s.id))) + 1 : 1).toString(),
        name: params[0],
        email: params[1],
        address: params[2],
        storeId: params[3] || null, // owner_id
        createdAt: new Date().toISOString(),
      }
      stores.push(newStore)
      localStorage.setItem("stores", JSON.stringify(stores))
      return { rows: [newStore] as T[], rowCount: 1 }
    }
    if (sql.includes("INTO ratings")) {
      const ratings = JSON.parse(localStorage.getItem("ratings") || "[]")
      const newRating = {
        id: (ratings.length > 0 ? Math.max(...ratings.map((r: Rating) => parseInt(r.id))) + 1 : 1).toString(),
        userId: params[0],
        storeId: params[1],
        rating: params[2],
        comment: params[3],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      ratings.push(newRating)
      localStorage.setItem("ratings", JSON.stringify(ratings))
      return { rows: [newRating] as T[], rowCount: 1 }
    }
    return { rows: [], rowCount: 0 }
  }

  private handleUpdate<T>(sql: string, params: any[]): { rows: T[]; rowCount: number } {
    // Simulate UPDATE operations
    if (sql.includes("UPDATE users")) {
      let users = JSON.parse(localStorage.getItem("users") || "[]")
      const id = params[params.length - 1] // ID is always the last parameter
      const userIndex = users.findIndex((u: User) => u.id === id)

      if (userIndex > -1) {
        const user = users[userIndex]
        if (sql.includes("name = ")) user.name = params[0]
        if (sql.includes("email = ")) user.email = params[sql.includes("name = ") ? 1 : 0]
        if (sql.includes("password = ")) user.password = params[sql.includes("name = ") && sql.includes("email = ") ? 2 : (sql.includes("name = ") || sql.includes("email = ") ? 1 : 0)]
        if (sql.includes("address = ")) user.address = params[sql.includes("name = ") && sql.includes("email = ") && sql.includes("password = ") ? 3 : (sql.includes("name = ") && sql.includes("email = ") || sql.includes("name = ") && sql.includes("password = ") || sql.includes("email = ") && sql.includes("password = ") ? 2 : (sql.includes("name = ") || sql.includes("email = ") || sql.includes("password = ") ? 1 : 0))]
        if (sql.includes("role = ")) user.role = params[sql.includes("name = ") && sql.includes("email = ") && sql.includes("password = ") && sql.includes("address = ") ? 4 : (sql.includes("name = ") && sql.includes("email = ") && sql.includes("password = ") || sql.includes("name = ") && sql.includes("email = ") && sql.includes("address = ") || sql.includes("name = ") && sql.includes("password = ") && sql.includes("address = ") || sql.includes("email = ") && sql.includes("password = ") && sql.includes("address = ") ? 3 : (sql.includes("name = ") && sql.includes("email = ") || sql.includes("name = ") && sql.includes("password = ") || sql.includes("name = ") && sql.includes("address = ") || sql.includes("email = ") && sql.includes("password = ") || sql.includes("email = ") && sql.includes("address = ") || sql.includes("password = ") && sql.includes("address = ") ? 2 : (sql.includes("name = ") || sql.includes("email = ") || sql.includes("password = ") || sql.includes("address = ") ? 1 : 0)))]
        user.updatedAt = new Date().toISOString()
        localStorage.setItem("users", JSON.stringify(users))
        return { rows: [user] as T[], rowCount: 1 }
      }
      return { rows: [], rowCount: 0 }
    }
    if (sql.includes("UPDATE stores")) {
      let stores = JSON.parse(localStorage.getItem("stores") || "[]")
      const id = params[params.length - 1]
      const storeIndex = stores.findIndex((s: Store) => s.id === id)

      if (storeIndex > -1) {
        const store = stores[storeIndex]
        if (sql.includes("name = ")) store.name = params[0]
        if (sql.includes("email = ")) store.email = params[sql.includes("name = ") ? 1 : 0]
        if (sql.includes("address = ")) store.address = params[sql.includes("name = ") && sql.includes("email = ") ? 2 : (sql.includes("name = ") || sql.includes("email = ") ? 1 : 0)]
        localStorage.setItem("stores", JSON.stringify(stores))
        return { rows: [store] as T[], rowCount: 1 }
      }
      return { rows: [], rowCount: 0 }
    }
    if (sql.includes("UPDATE ratings")) {
      let ratings = JSON.parse(localStorage.getItem("ratings") || "[]")
      const id = params[params.length - 1]
      const ratingIndex = ratings.findIndex((r: Rating) => r.id === id)

      if (ratingIndex > -1) {
        const rating = ratings[ratingIndex]
        if (sql.includes("rating = ")) rating.rating = params[0]
        if (sql.includes("comment = ")) rating.comment = params[sql.includes("rating = ") ? 1 : 0]
        rating.updatedAt = new Date().toISOString()
        localStorage.setItem("ratings", JSON.stringify(ratings))
        return { rows: [rating] as T[], rowCount: 1 }
      }
      return { rows: [], rowCount: 0 }
    }
    return { rows: [], rowCount: 0 }
  }

  private handleDelete<T>(sql: string, params: any[]): { rows: T[]; rowCount: number } {
    // Simulate DELETE operations
    if (sql.includes("FROM users")) {
      let users = JSON.parse(localStorage.getItem("users") || "[]")
      const initialLength = users.length
      users = users.filter((user: User) => user.id !== params[0])
      localStorage.setItem("users", JSON.stringify(users))
      return { rows: [], rowCount: initialLength - users.length }
    }
    if (sql.includes("FROM stores")) {
      let stores = JSON.parse(localStorage.getItem("stores") || "[]")
      const initialLength = stores.length
      stores = stores.filter((store: Store) => store.id !== params[0])
      localStorage.setItem("stores", JSON.stringify(stores))
      return { rows: [], rowCount: initialLength - stores.length }
    }
    if (sql.includes("FROM ratings")) {
      let ratings = JSON.parse(localStorage.getItem("ratings") || "[]")
      const initialLength = ratings.length
      ratings = ratings.filter((rating: Rating) => rating.id !== params[0])
      localStorage.setItem("ratings", JSON.stringify(ratings))
      return { rows: [], rowCount: initialLength - ratings.length }
    }
    return { rows: [], rowCount: 0 }
  }
}

export const db = DatabasePool.getInstance()