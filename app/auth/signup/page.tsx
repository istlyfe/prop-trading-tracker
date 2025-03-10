import { SignUpForm } from "@/components/auth/sign-up-form"
import { DatabaseCheck } from "@/components/db-check"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up | Prop Trading Tracker",
  description: "Create a new account for your prop trading tracker",
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center py-12">
      <div className="mx-auto grid w-full max-w-md gap-6">
        <DatabaseCheck />
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Create a new account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your details below to create your account
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
} 