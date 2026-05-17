// apps/web/src/app/page.tsx
"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/AuthProvider"

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) return null

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <p className="text-muted-foreground">
        Track everything you have watched, read, or listened to.
      </p>
      <div className="flex gap-3">
        {user ? (
          <Button asChild>
            <Link href="/records">My Records</Link>
          </Button>
        ) : (
          <>
            <Button asChild>
              <Link href="/login">Get Started</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">My Records</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
