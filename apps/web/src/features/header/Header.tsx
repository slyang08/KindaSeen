// src/features/header/Header.tsx
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/AuthProvider"

import { SearchDialog } from "../search"

export function Header() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  return (
    <header className="border-b">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">
          KindaSeen
        </Link>

        <div className="flex items-center gap-3">
          {!loading && (
            <>
              {user ? (
                <>
                  {/* Header search, after selection, it will be directed to the records page with query */}
                  <SearchDialog
                    onSelect={(result) => {
                      if (window.location.pathname === "/records") {
                        // Already on the records page, dispatch event directly
                        window.dispatchEvent(new CustomEvent("tmdb:selected", { detail: result }))
                      } else {
                        // Not on the records page, save to sessionStorage before redirecting
                        sessionStorage.setItem("pendingTMDB", JSON.stringify(result))
                        router.push("/records")
                      }
                    }}
                  />
                  <span className="text-sm text-muted-foreground">
                    Hi, {user.email?.split("@")[0].replace(/^./, (c) => c.toUpperCase())}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/records">My Records</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/statistics">Statistics</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await logout()
                      router.push("/")
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/register">Register</Link>
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
