"use client"

import { Suspense } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ErrorContent } from "./error-content"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center py-12">
      <div className="mx-auto grid w-full max-w-md gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<p>Loading error details...</p>}>
              <ErrorContent />
            </Suspense>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/auth/signin">Back to Sign In</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 