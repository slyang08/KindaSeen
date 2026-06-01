// apps/web/src/features/favorites/SharedFavoritesPage.tsx
"use client"

import { MEDIA_TYPE_LABELS, SharedFavorite, STATUS_COLORS, STATUS_LABELS } from "@kindaseen/shared"
import Image from "next/image"
import { useEffect, useState } from "react"

import { getSharedFavorites } from "@/lib/favorites"
import { getPublicFavorites } from "@/lib/users"

type Props = { username: string; token?: never } | { token: string; username?: never }

export function SharedFavoritesPage({ username, token }: Props) {
  const [favorites, setFavorites] = useState<SharedFavorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = username
          ? await getPublicFavorites(username)
          : await getSharedFavorites(token!)
        setFavorites(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [username, token])

  if (loading) return <div className="p-6 text-center text-muted-foreground">Loading...</div>

  if (error)
    return (
      <div className="p-6 text-center space-y-2">
        <p className="text-lg font-medium">Oops</p>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <h1 className="text-xl font-semibold">
        {username ? `${username}'s Favorites` : "Shared Favorites"}
      </h1>

      {favorites.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No favorites yet.</p>
      ) : (
        <div className="space-y-3">
          {favorites.map((fav) => {
            const record = fav.record
            const title = record.release_year
              ? `${record.title} (${record.release_year})`
              : record.title
            const statusColor =
              STATUS_COLORS[record.status as keyof typeof STATUS_COLORS] ?? "text-muted-foreground"
            const watchMeta = [
              record.season && record.season > 1 ? `S${record.season}` : null,
              record.episode != null ? `EP ${record.episode}` : null,
              record.rating != null ? `★ ${record.rating}/10` : null,
            ]
              .filter(Boolean)
              .join(" · ")

            return (
              <div key={fav.id} className="flex items-start gap-3 p-4 border rounded-lg">
                <div className="shrink-0 w-14 h-20 sm:w-16 sm:h-24 rounded overflow-hidden bg-muted flex items-center justify-center">
                  {record.poster_url ? (
                    <Image
                      src={record.poster_url}
                      alt={record.title}
                      width={64}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground text-center leading-tight px-1">
                      No Image
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium leading-snug">{title}</p>
                    <span className="text-xs border rounded px-1.5 py-0.5 text-muted-foreground shrink-0">
                      {MEDIA_TYPE_LABELS[record.media_type as keyof typeof MEDIA_TYPE_LABELS] ??
                        record.media_type}
                    </span>
                  </div>

                  <p className="text-sm">
                    <span className={statusColor}>
                      {STATUS_LABELS[record.status as keyof typeof STATUS_LABELS] ?? record.status}
                    </span>
                    {watchMeta && <span className="text-muted-foreground"> · {watchMeta}</span>}
                  </p>

                  {record.genres && record.genres.length > 0 && (
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                      {record.genres.map((genre) => (
                        <span key={genre} className="text-xs text-muted-foreground">
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}

                  {record.overview && (
                    <p className="text-xs text-muted-foreground/70 line-clamp-2">
                      {record.overview}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
