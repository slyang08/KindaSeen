// apps/web/src/features/search/SearchCombobox.tsx
"use client"

import type { TMDBSearchResult } from "@kindaseen/shared"
import { BookmarkCheck, BookmarkPlus, Plus, Search } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { tmdbApi } from "@/lib/tmdb"

type Props = {
  onSelect: (result: TMDBSearchResult) => void
  onAddToWatchlist?: (result: TMDBSearchResult) => void
  onRemoveFromWatchlist?: (result: TMDBSearchResult) => void
  watchlistTmdbIds?: Set<number>
  placeholder?: string
  defaultQuery?: string
  onQueryChange?: (q: string) => void
}

export function SearchCombobox({
  onSelect,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  watchlistTmdbIds,
  placeholder = "Search from TMDB...",
  defaultQuery = "",
  onQueryChange,
}: Props) {
  const [query, setQuery] = useState(defaultQuery)
  const [results, setResults] = useState<TMDBSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [pendingRemoveId, setPendingRemoveId] = useState<number | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      if (!query.trim()) {
        setResults([])
        setPendingRemoveId(null)
        return
      }

      setLoading(true)
      try {
        const data = await tmdbApi.search(query)
        setResults(data)
      } finally {
        setLoading(false)
      }
    }, 400)
  }, [query])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    onQueryChange?.(e.target.value)
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input value={query} onChange={handleChange} placeholder={placeholder} className="pl-9" />
      </div>

      {(results.length > 0 || loading) && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-[70vh] overflow-y-auto">
          {loading && <div className="px-4 py-3 text-sm text-muted-foreground">Searching...</div>}
          {!loading &&
            results.map((result) => {
              return (
                <div
                  key={result.tmdb_id}
                  className="flex items-center gap-3 w-full px-3 py-2 hover:bg-accent transition-colors"
                >
                  {/* Poster */}
                  {result.poster_url ? (
                    <Image
                      src={result.poster_url}
                      alt={result.title}
                      width={64}
                      height={96}
                      className="h-24 w-16 object-cover rounded shrink-0"
                    />
                  ) : (
                    <div className="h-12 w-8 bg-muted rounded shrink-0" />
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {result.media_type === "movie" ? "Movie" : "TV"}
                      {result.release_year ? ` · ${result.release_year}` : ""}
                      {result.tmdb_rating ? ` · ★ ${result.tmdb_rating}` : ""}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {onAddToWatchlist &&
                      (() => {
                        const inWatchlist =
                          result.tmdb_id != null && watchlistTmdbIds?.has(result.tmdb_id)
                        const isPendingRemove = result.tmdb_id === pendingRemoveId

                        if (isPendingRemove) {
                          return (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  onRemoveFromWatchlist?.(result)
                                  setPendingRemoveId(null)
                                  toast.success(`"${result.title}" removed from Watchlist`)
                                }}
                                className="text-xs px-2 py-1 rounded bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
                              >
                                Remove
                              </button>
                              <button
                                type="button"
                                onClick={() => setPendingRemoveId(null)}
                                className="text-xs px-2 py-1 rounded hover:bg-muted transition-colors text-muted-foreground"
                              >
                                Cancel
                              </button>
                            </div>
                          )
                        }

                        return (
                          <button
                            type="button"
                            onClick={() => {
                              if (inWatchlist) {
                                setPendingRemoveId(result.tmdb_id)
                              } else {
                                onAddToWatchlist(result)
                                toast.success(`"${result.title}" Added to Watchlist`)
                                setResults([])
                              }
                            }}
                            className={`p-1.5 rounded hover:bg-muted transition-colors ${
                              inWatchlist ? "text-primary" : "text-muted-foreground"
                            }`}
                            title={
                              inWatchlist ? "In Watchlist · click to remove" : "Add to Watchlist"
                            }
                          >
                            {inWatchlist ? (
                              <BookmarkCheck className="size-4" />
                            ) : (
                              <BookmarkPlus className="size-4" />
                            )}
                          </button>
                        )
                      })()}
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(result)
                        setResults([])
                      }}
                      className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
                      title="Add to Records"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
