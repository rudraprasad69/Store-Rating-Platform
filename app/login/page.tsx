"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { validateEmail, validatePassword } from "@/lib/validation"
import { WaveLoader } from "@/components/ui/wave-loader"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (value) {
      const validation = validateEmail(value)
      setEmailError(validation.isValid ? "" : validation.error || "")
    } else {
      setEmailError("")
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    if (value) {
      const validation = validatePassword(value)
      setPasswordError(validation.isValid ? "" : validation.error || "")
    } else {
      setPasswordError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    console.log("[v0] Login form submitted, isLoading set to:", true)

    const emailValidation = validateEmail(email)
    const passwordValidation = validatePassword(password)

    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || "")
      setIsLoading(false)
      console.log("[v0] Email validation failed, isLoading set to:", false)
      return
    }

    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error || "")
      setIsLoading(false)
      console.log("[v0] Password validation failed, isLoading set to:", false)
      return
    }

    try {
      console.log("[v0] Attempting login...")
      const success = await login(email, password)
      console.log("[v0] Login result:", success)
      if (success) {
        // Redirect will be handled by the auth context and protected routes
        router.push("/")
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      console.log("[v0] Login error:", err)
      setError("An error occurred during login")
    } finally {
      setIsLoading(false)
      console.log("[v0] Login process completed, isLoading set to:", false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Store Rating Platform</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                required
                placeholder="Enter your email"
                className={emailError ? "border-destructive" : ""}
              />
              {emailError && <p className="text-sm text-destructive">{emailError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                required
                placeholder="Enter your password"
                className={passwordError ? "border-destructive" : ""}
              />
              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading || !!emailError || !!passwordError}>
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  {console.log("[v0] Rendering WaveLoader component")}
                  <WaveLoader />
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Demo Accounts:</p>
            <div className="text-xs space-y-1">
              <p>
                <strong>Admin:</strong> admin@example.com / admin123
              </p>
              <p>
                <strong>User:</strong> john@example.com / user123
              </p>
              <p>
                <strong>Store Owner:</strong> owner@example.com / owner123
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
