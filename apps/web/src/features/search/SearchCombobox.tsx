// apps/web/src/features/search/SearchCombobox.tsx
"use client"

import type { TMDBSearchResult } from "@kindaseen/shared"
import { Search } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import { Input } from "@/components/ui/input"
import { tmdbApi } from "@/lib/tmdb"

type Props = {
  onSelect: (result: TMDBSearchResult) => void
  placeholder?: string
  defaultQuery?: string
  onQueryChange?: (q: string) => void
}

export function SearchCombobox({
  onSelect,
  placeholder = "Search from TMDB...",
  defaultQuery = "",
  onQueryChange,
}: Props) {
  const [query, setQuery] = useState(defaultQuery)
  const [results, setResults] = useState<TMDBSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      if (!query.trim()) {
        setResults([])
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
            results.map((result) => (
              <button
                key={result.tmdb_id}
                type="button"
                onClick={() => {
                  onSelect(result)
                  setResults([])
                }}
                className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-accent transition-colors"
              >
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
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{result.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {result.media_type === "movie" ? "Movie" : "TV"}
                    {result.release_year ? ` · ${result.release_year}` : ""}
                    {result.tmdb_rating ? ` · ★ ${result.tmdb_rating}` : ""}
                  </p>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
