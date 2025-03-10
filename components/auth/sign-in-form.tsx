"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Icons } from "@/components/icons"
import Link from "next/link"
import { useRouter } from "next/navigation"

const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

type SignInValues = z.infer<typeof SignInSchema>

export function SignInForm() {
  const router = useRouter()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isAppleLoading, setIsAppleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const form = useForm<SignInValues>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })
  
  const isSubmitting = form.formState.isSubmitting

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      const result = await signIn("google", { 
        callbackUrl: "/dashboard",
        redirect: true
      })
      
      if (result?.error) {
        console.error("Error signing in with Google:", result.error)
        setError("Failed to sign in with Google. Please try again.")
      } else if (result?.url) {
        window.location.href = result.url
      }
    } catch (error) {
      console.error("Error signing in with Google:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleAppleSignIn = async () => {
    setIsAppleLoading(true)
    try {
      const result = await signIn("apple", { 
        callbackUrl: "/dashboard",
        redirect: true
      })
      
      if (result?.error) {
        console.error("Error signing in with Apple:", result.error)
        setError("Failed to sign in with Apple. Please try again.")
      } else if (result?.url) {
        window.location.href = result.url
      }
    } catch (error) {
      console.error("Error signing in with Apple:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsAppleLoading(false)
    }
  }
  
  const onSubmit = async (data: SignInValues) => {
    setError(null)
    
    try {
      console.log("Attempting to sign in with credentials:", data.email)
      
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })
      
      if (result?.error) {
        console.error("Sign-in error:", result.error)
        setError("Invalid email or password")
        return
      }
      
      console.log("Sign-in successful, redirecting to dashboard")
      router.push("/dashboard")
    } catch (error) {
      console.error("Unexpected error during sign-in:", error)
      setError("An unexpected error occurred")
    }
  }

  return (
    <Card className="p-6 space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your password" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {error && (
            <div className="p-3 text-sm text-white bg-red-500 rounded">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </Form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <div className="flex flex-col space-y-3">
        <Button 
          variant="outline" 
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="relative"
        >
          {isGoogleLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}
          Sign in with Google
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleAppleSignIn}
          disabled={isAppleLoading}
          className="relative"
        >
          {isAppleLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.apple className="mr-2 h-4 w-4" />
          )}
          Sign in with Apple
        </Button>
      </div>
      
      <div className="text-center text-sm">
        Don't have an account?{" "}
        <Link href="/auth/signup" className="underline">
          Sign up
        </Link>
      </div>
    </Card>
  )
} 