"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import { db } from "@/lib/database"
import { validateName, validateEmail, validatePassword, validateAddress } from "@/lib/validation"
import { Eye, EyeOff, CheckCircle } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Real-time validation
    let validation = { isValid: true, error: "" }
    switch (name) {
      case "name":
        validation = validateName(value)
        break
      case "email":
        validation = validateEmail(value)
        break
      case "password":
        validation = validatePassword(value)
        break
      case "confirmPassword":
        if (value && value !== formData.password) {
          validation = { isValid: false, error: "Passwords do not match" }
        }
        break
      case "address":
        validation = validateAddress(value)
        break
    }

    setFieldErrors((prev) => ({
      ...prev,
      [name]: validation.isValid ? "" : validation.error || "",
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const nameValidation = validateName(formData.name)
      const emailValidation = validateEmail(formData.email)
      const passwordValidation = validatePassword(formData.password)
      const addressValidation = validateAddress(formData.address)

      if (!nameValidation.isValid) {
        setError(nameValidation.error || "Invalid name")
        return
      }

      if (!emailValidation.isValid) {
        setError(emailValidation.error || "Invalid email")
        return
      }

      if (!passwordValidation.isValid) {
        setError(passwordValidation.error || "Invalid password")
        return
      }

      if (!addressValidation.isValid) {
        setError(addressValidation.error || "Invalid address")
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        return
      }

      // Create new user
      await db.createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        address: formData.address,
        role: "user", // Normal users can only register as "user"
      })

      setShowSuccessDialog(true)
    } catch (err) {
      setError("An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false)
    router.push("/login")
  }

  const hasErrors = Object.values(fieldErrors).some((error) => error !== "")

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Sign up for a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                className={fieldErrors.name ? "border-destructive" : ""}
              />
              {fieldErrors.name && <p className="text-sm text-destructive">{fieldErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className={fieldErrors.email ? "border-destructive" : ""}
              />
              {fieldErrors.email && <p className="text-sm text-destructive">{fieldErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="8-16 chars, uppercase & special character"
                  className={fieldErrors.password ? "border-destructive pr-10" : "pr-10"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {fieldErrors.password && <p className="text-sm text-destructive">{fieldErrors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your password"
                  className={fieldErrors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {fieldErrors.confirmPassword && <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Enter your address (max 400 characters)"
                rows={3}
                className={fieldErrors.address ? "border-destructive" : ""}
              />
              {fieldErrors.address && <p className="text-sm text-destructive">{fieldErrors.address}</p>}
              <p className="text-xs text-muted-foreground">{formData.address.length}/400 characters</p>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading || hasErrors}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showSuccessDialog} onOpenChange={handleSuccessDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-center">Registration Successful!</DialogTitle>
            <DialogDescription className="text-center">
              Your account has been created successfully. You can now sign in with your credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Button onClick={handleSuccessDialogClose} className="w-full">
              Continue to Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
