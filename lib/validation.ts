export interface ValidationResult {
  isValid: boolean
  error?: string
}

export const validateName = (name: string): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, error: "Name is required" }
  }
  if (name.length > 60) {
    return { isValid: false, error: "Name must not exceed 60 characters" }
  }
  return { isValid: true }
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, error: "Email is required" }
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" }
  }
  return { isValid: true }
}

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: "Password is required" }
  }
  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters long" }
  }
  if (password.length > 16) {
    return { isValid: false, error: "Password must not exceed 16 characters" }
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one uppercase letter" }
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one special character" }
  }
  return { isValid: true }
}

export const validateAddress = (address: string): ValidationResult => {
  if (!address.trim()) {
    return { isValid: false, error: "Address is required" }
  }
  if (address.length > 400) {
    return { isValid: false, error: "Address must not exceed 400 characters" }
  }
  return { isValid: true }
}

export const validateStoreName = (name: string): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, error: "Store name is required" }
  }
  if (name.length < 3) {
    return { isValid: false, error: "Store name must be at least 3 characters long" }
  }
  if (name.length > 100) {
    return { isValid: false, error: "Store name must not exceed 100 characters" }
  }
  return { isValid: true }
}

export const validateComment = (comment: string): ValidationResult => {
  if (comment && comment.length > 500) {
    return { isValid: false, error: "Comment must not exceed 500 characters" }
  }
  return { isValid: true }
}
