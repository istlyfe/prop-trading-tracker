import { SignInForm } from "@/components/auth/sign-in-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In | Prop Trading Tracker",
  description: "Sign in to your prop trading tracker account",
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center py-12">
      <div className="mx-auto grid w-full max-w-md gap-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Sign in to your account
          </h1>
          <p className="text-sm text-muted-foreground">
            Choose your preferred sign in method
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  )
} 