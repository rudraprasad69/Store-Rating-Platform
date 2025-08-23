import type { User, Store, Rating, AuthUser } from "./types"
import { db as client } from "./database-client"

class PostgreSQLDatabase {
  // User operations
  async getUsers(): Promise<User[]> {
    const result = await client.query<User>(
      "SELECT id, name, email, password, address, role, created_at as createdAt, updated_at as updatedAt FROM users ORDER BY created_at DESC",
    )
    return result.rows
  }

  async getUserById(id: string): Promise<User | undefined> {
    const result = await client.query<User>(
      "SELECT id, name, email, password, address, role, created_at as createdAt, updated_at as updatedAt FROM users WHERE id = $1",
      [id],
    )
    return result.rows[0]
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await client.query<User>(
      "SELECT id, name, email, password, address, role, created_at as createdAt, updated_at as updatedAt FROM users WHERE email = $1",
      [email],
    )
    return result.rows[0]
  }

  async createUser(userData: Omit<User, "id" | "createdAt">): Promise<User> {
    const result = await client.query<User>(
      `INSERT INTO users (name, email, password, address, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, password, address, role, created_at as createdAt, updated_at as updatedAt`,
      [userData.name, userData.email, userData.password, userData.address, userData.role],
    )
    return result.rows[0]
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const setParts: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (updates.name) {
      setParts.push(`name = $${paramIndex++}`)
      values.push(updates.name)
    }
    if (updates.email) {
      setParts.push(`email = $${paramIndex++}`)
      values.push(updates.email)
    }
    if (updates.password) {
      setParts.push(`password = $${paramIndex++}`)
      values.push(updates.password)
    }
    if (updates.address) {
      setParts.push(`address = $${paramIndex++}`)
      values.push(updates.address)
    }
    if (updates.role) {
      setParts.push(`role = $${paramIndex++}`)
      values.push(updates.role)
    }

    if (setParts.length === 0) return null

    setParts.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const result = await client.query<User>(
      `UPDATE users SET ${setParts.join(", ")} WHERE id = $${paramIndex} 
       RETURNING id, name, email, password, address, role, created_at as createdAt, updated_at as updatedAt`,
      values,
    )
    return result.rows[0] || null
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await client.query("DELETE FROM users WHERE id = $1", [id])
    return result.rowCount > 0
  }

  // Store operations
  async getStores(): Promise<Store[]> {
    const result = await client.query<Store & { average_rating: number; total_ratings: number }>(
      "SELECT * FROM store_ratings_view ORDER BY name",
    )
    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      address: row.address,
      averageRating: row.average_rating,
      totalRatings: row.total_ratings,
      createdAt: new Date(),
    }))
  }

  async getStoreById(id: string): Promise<Store | undefined> {
    const result = await client.query<Store & { average_rating: number; total_ratings: number }>(
      "SELECT * FROM store_ratings_view WHERE id = $1",
      [id],
    )
    if (!result.rows[0]) return undefined

    const row = result.rows[0]
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      address: row.address,
      averageRating: row.average_rating,
      totalRatings: row.total_ratings,
      createdAt: new Date(),
    }
  }

  async createStore(storeData: Omit<Store, "id" | "createdAt" | "averageRating" | "totalRatings">): Promise<Store> {
    const result = await client.query<{ id: string; name: string; email: string; address: string; created_at: string }>(
      `INSERT INTO stores (name, email, address, owner_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, address, created_at`,
      [storeData.name, storeData.email, storeData.address, storeData.storeId || null],
    )

    const newStore = result.rows[0]
    return {
      id: newStore.id,
      name: newStore.name,
      email: newStore.email,
      address: newStore.address,
      averageRating: 0,
      totalRatings: 0,
      createdAt: new Date(newStore.created_at),
    }
  }

  async updateStore(id: string, updates: Partial<Store>): Promise<Store | null> {
    const setParts: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (updates.name) {
      setParts.push(`name = $${paramIndex++}`)
      values.push(updates.name)
    }
    if (updates.email) {
      setParts.push(`email = $${paramIndex++}`)
      values.push(updates.email)
    }
    if (updates.address) {
      setParts.push(`address = $${paramIndex++}`)
      values.push(updates.address)
    }

    if (setParts.length === 0) return null

    setParts.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const result = await client.query<{ id: string; name: string; email: string; address: string }>(
      `UPDATE stores SET ${setParts.join(", ")} WHERE id = $${paramIndex} 
       RETURNING id, name, email, address`,
      values,
    )

    if (!result.rows[0]) return null

    // Get updated store with ratings
    return (await this.getStoreById(id)) || null
  }

  async deleteStore(id: string): Promise<boolean> {
    const result = await client.query("DELETE FROM stores WHERE id = $1", [id])
    return result.rowCount > 0
  }

  // Rating operations
  async getRatings(): Promise<Rating[]> {
    const result = await client.query<Rating>(
      `SELECT id, user_id as userId, store_id as storeId, rating, comment, 
       created_at as createdAt, updated_at as updatedAt FROM ratings ORDER BY created_at DESC`,
    )
    return result.rows
  }

  async getRatingsByStoreId(storeId: string): Promise<Rating[]> {
    const result = await client.query<Rating>(
      `SELECT id, user_id as userId, store_id as storeId, rating, comment, 
       created_at as createdAt, updated_at as updatedAt FROM ratings WHERE store_id = $1 ORDER BY created_at DESC`,
      [storeId],
    )
    return result.rows
  }

  async getRatingsByUserId(userId: string): Promise<Rating[]> {
    const result = await client.query<Rating>(
      `SELECT id, user_id as userId, store_id as storeId, rating, comment, 
       created_at as createdAt, updated_at as updatedAt FROM ratings WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    )
    return result.rows
  }

  async getUserRatingForStore(userId: string, storeId: string): Promise<Rating | undefined> {
    const result = await client.query<Rating>(
      `SELECT id, user_id as userId, store_id as storeId, rating, comment, 
       created_at as createdAt, updated_at as updatedAt FROM ratings WHERE user_id = $1 AND store_id = $2`,
      [userId, storeId],
    )
    return result.rows[0]
  }

  async createRating(ratingData: Omit<Rating, "id" | "createdAt">): Promise<Rating> {
    const result = await client.query<Rating>(
      `INSERT INTO ratings (user_id, store_id, rating, comment) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, user_id as userId, store_id as storeId, rating, comment, created_at as createdAt, updated_at as updatedAt`,
      [ratingData.userId, ratingData.storeId, ratingData.rating, ratingData.comment],
    )
    return result.rows[0]
  }

  async updateRating(id: string, updates: Partial<Rating>): Promise<Rating | null> {
    const setParts: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (updates.rating !== undefined) {
      setParts.push(`rating = $${paramIndex++}`)
      values.push(updates.rating)
    }
    if (updates.comment !== undefined) {
      setParts.push(`comment = $${paramIndex++}`)
      values.push(updates.comment)
    }

    if (setParts.length === 0) return null

    setParts.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(id)

    const result = await client.query<Rating>(
      `UPDATE ratings SET ${setParts.join(", ")} WHERE id = $${paramIndex} 
       RETURNING id, user_id as userId, store_id as storeId, rating, comment, created_at as createdAt, updated_at as updatedAt`,
      values,
    )
    return result.rows[0] || null
  }

  async deleteRating(id: string): Promise<boolean> {
    const result = await client.query("DELETE FROM ratings WHERE id = $1", [id])
    return result.rowCount > 0
  }

  // Authentication
  async authenticate(email: string, password: string): Promise<AuthUser | null> {
    const user = await this.getUserByEmail(email)
    if (!user || user.password !== password) return null

    // Get store ID if user is a store owner
    let storeId: string | undefined
    if (user.role === "store_owner") {
      const storeResult = await client.query<{ id: string }>("SELECT id FROM stores WHERE owner_id = $1 LIMIT 1", [
        user.id,
      ])
      storeId = storeResult.rows[0]?.id
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      storeId,
    }
  }

  // Statistics
  async getStats() {
    const [usersResult, storesResult, ratingsResult] = await Promise.all([
      client.query<{ count: number; role: string }>("SELECT COUNT(*) as count, role FROM users GROUP BY role"),
      client.query<{ count: number }>("SELECT COUNT(*) as count FROM stores"),
      client.query<{ count: number }>("SELECT COUNT(*) as count FROM ratings"),
    ])

    const userStats = usersResult.rows.reduce(
      (acc, row) => {
        acc[row.role] = row.count
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalUsers: Object.values(userStats).reduce((sum, count) => sum + count, 0),
      totalStores: storesResult.rows[0]?.count || 0,
      totalRatings: ratingsResult.rows[0]?.count || 0,
      adminUsers: userStats.admin || 0,
      normalUsers: userStats.user || 0,
      storeOwners: userStats.store_owner || 0,
    }
  }
}

export const database = new PostgreSQLDatabase()
export const db = database
