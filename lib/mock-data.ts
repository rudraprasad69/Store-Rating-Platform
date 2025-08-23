import type { User, Store, Rating } from "./types"

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    address: "123 Admin St, City, State",
    role: "admin",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "John Doe",
    email: "john@example.com",
    password: "user123",
    address: "456 User Ave, City, State",
    role: "user",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "3",
    name: "Store Owner",
    email: "owner@example.com",
    password: "owner123",
    address: "789 Store Blvd, City, State",
    role: "store_owner",
    storeId: "1",
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "4",
    name: "Jane Smith",
    email: "jane@example.com",
    password: "user123",
    address: "321 Customer Rd, City, State",
    role: "user",
    createdAt: new Date("2024-02-01"),
  },
]

export const mockStores: Store[] = [
  {
    id: "1",
    name: "Tech Gadgets",
    email: "contact@techgadgets.com",
    address: "101 Tech Plaza, Silicon Valley",
    ownerId: "3",
    averageRating: 4.5,
    totalRatings: 120,
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "2",
    name: "Urban Threads",
    email: "info@urbanthreads.com",
    address: "202 Style Street, Fashion District",
    ownerId: "3",
    averageRating: 4.2,
    totalRatings: 85,
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "3",
    name: "The Daily Grind",
    email: "hello@dailygrind.com",
    address: "303 Bean Avenue, Central City",
    ownerId: "3",
    averageRating: 4.8,
    totalRatings: 250,
    createdAt: new Date("2024-02-05"),
  },
  {
    id: "4",
    name: "Bookworm's Paradise",
    email: "books@paradise.com",
    address: "404 Readwell Road, Library District",
    ownerId: "3",
    averageRating: 4.9,
    totalRatings: 300,
    createdAt: new Date("2024-02-10"),
  },
  {
    id: "5",
    name: "Green Leaf Grocers",
    email: "groceries@greenleaf.com",
    address: "505 Organic Way, Farmstead",
    ownerId: "3",
    averageRating: 4.6,
    totalRatings: 180,
    createdAt: new Date("2024-03-01"),
  },
  {
    id: "6",
    name: "Fit Hub Fitness",
    email: "getfit@fithub.com",
    address: "606 Muscle Street, Gainsville",
    ownerId: "3",
    averageRating: 4.3,
    totalRatings: 95,
    createdAt: new Date("2024-03-15"),
  },
];

export const mockRatings: Rating[] = [
  // Ratings for Tech Gadgets
  { id: "1", userId: "2", storeId: "1", rating: 4, comment: "Great selection, but a bit pricey.", createdAt: new Date("2024-02-10") },
  { id: "2", userId: "4", storeId: "1", rating: 5, comment: "Excellent customer service and fast shipping!", createdAt: new Date("2024-02-15") },

  // Ratings for Urban Threads
  { id: "3", userId: "2", storeId: "2", rating: 5, comment: "Love the unique styles here!", createdAt: new Date("2024-02-20") },
  { id: "4", userId: "4", storeId: "2", rating: 3, comment: "Sizing can be inconsistent.", createdAt: new Date("2024-03-01") },

  // Ratings for The Daily Grind
  { id: "5", userId: "2", storeId: "3", rating: 5, comment: "Best coffee in the city, hands down.", createdAt: new Date("2024-03-05") },
  { id: "6", userId: "4", storeId: "3", rating: 4, comment: "Cozy atmosphere, but can get crowded.", createdAt: new Date("2024-03-10") },

  // Ratings for Bookworm's Paradise
  { id: "7", userId: "2", storeId: "4", rating: 5, comment: "An amazing collection of rare books.", createdAt: new Date("2024-03-12") },

  // User 2 has rated multiple stores
  { id: "8", userId: "2", storeId: "5", rating: 4, comment: "Fresh produce and friendly staff.", createdAt: new Date("2024-03-20") },
];
