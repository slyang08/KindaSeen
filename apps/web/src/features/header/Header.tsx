// src/features/header/Header.tsx
"use client"

import type { TMDBSearchResult } from "@kindaseen/shared"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/AuthProvider"
import { useCreateRecord } from "@/features/records/queries"

import { SearchDialog } from "../search"

export function Header() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const createRecord = useCreateRecord()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleAddToWatchlist = (result: TMDBSearchResult) => {
    createRecord.mutate({
      title: result.title,
      media_type: result.media_type === "movie" ? "movie" : "drama",
      status: "want_to_watch",
      season: 1,
      episode: 1,
      tmdb_id: result.tmdb_id ?? null,
      poster_url: result.poster_url ?? null,
      overview: result.overview ?? null,
      tmdb_rating: result.tmdb_rating ?? null,
      genres: result.genres ?? [],
      release_year: result.release_year ? Number(result.release_year) : null,
      rating: null,
      notes: null,
    })
  }

  return (
    <header className="border-b relative z-50">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">
          KindaSeen
        </Link>

        {!loading && (
          <>
            {user ? (
              <>
                {/* Desktop nav */}
                <div className="hidden sm:flex items-center gap-3">
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
                    onAddToWatchlist={handleAddToWatchlist}
                  />
                  <span className="text-sm text-muted-foreground">
                    Hi, {user.email?.split("@")[0].replace(/^./, (c) => c.toUpperCase())}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/records">My Records</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/watchlist">Watchlist</Link>
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
                </div>

                {/* Mobile nav */}
                <div className="flex sm:hidden items-center gap-2">
                  <SearchDialog
                    onSelect={(result) => {
                      if (window.location.pathname === "/records") {
                        window.dispatchEvent(new CustomEvent("tmdb:selected", { detail: result }))
                      } else {
                        sessionStorage.setItem("pendingTMDB", JSON.stringify(result))
                        router.push("/records")
                      }
                    }}
                    onAddToWatchlist={handleAddToWatchlist}
                  />
                  <button
                    onClick={() => setMenuOpen((prev) => !prev)}
                    className="p-1.5 rounded hover:bg-muted transition-colors"
                  >
                    {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && user && (
        <>
          {/* optional backdrop */}
          <div
            className="fixed inset-0 bg-black/20 sm:hidden z-40"
            onClick={() => setMenuOpen(false)}
          />

          {/* floating menu */}
          <div className="sm:hidden absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[90%] max-w-md rounded-xl bg-background shadow-xl border z-50 animate-fade-in">
            <div className="px-6 py-3 flex flex-col gap-2">
              <span className="text-sm text-muted-foreground py-2">
                Hi, {user.email?.split("@")[0].replace(/^./, (c) => c.toUpperCase())}
              </span>
              <Link
                href="/records"
                onClick={() => setMenuOpen(false)}
                className="text-sm py-2 hover:text-muted-foreground transition-colors"
              >
                My Records
              </Link>
              <Link
                href="/watchlist"
                onClick={() => setMenuOpen(false)}
                className="text-sm py-2 hover:text-muted-foreground transition-colors"
              >
                Watchlist
              </Link>
              <Link
                href="/statistics"
                onClick={() => setMenuOpen(false)}
                className="text-sm py-2 hover:text-muted-foreground transition-colors"
              >
                Statistics
              </Link>
              <button
                onClick={async () => {
                  setMenuOpen(false)
                  await logout()
                  router.push("/")
                }}
                className="text-sm py-2 text-left text-destructive hover:opacity-80 transition-opacity"
              >
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
