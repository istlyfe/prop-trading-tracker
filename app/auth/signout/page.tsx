import { SignOutForm } from "@/components/auth/sign-out-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Out | Prop Trading Tracker",
  description: "Sign out of your prop trading tracker account",
}

export default function SignOutPage() {
  return (
    <div className="flex min-h-screen items-center justify-center py-12">
      <div className="mx-auto grid w-full max-w-md gap-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Sign out
          </h1>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to sign out?
          </p>
        </div>
        <SignOutForm />
      </div>
    </div>
  )
} 