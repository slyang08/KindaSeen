// apps/web/src/features/profile/PublicProfilePage.tsx
"use client"

import { SharedFavorite } from "@kindaseen/shared"
import Image from "next/image"
import Link from "next/link"

import { usePublicFavorites } from "@/features/favorites/queries"
import { UserActivityFeed } from "@/features/feed/UserActivityFeed"

import { usePublicWatchlist } from "../watchlist/queries"

type Props = { username: string }

export function PublicProfilePage({ username }: Props) {
  const {
    data: favorites,
    isLoading: favoritesLoading,
    error: favoritesError,
  } = usePublicFavorites(username)
  const {
    data: watchlist,
    isLoading: watchlistLoading,
    error: watchlistError,
  } = usePublicWatchlist(username)

  if (favoritesLoading || watchlistLoading) {
    return <div className="p-6 text-center text-muted-foreground">Loading...</div>
  }

  // Use favorites' privacy result to gate the whole page — if the profile is
  // private, activities shouldn't render either, even though /feed/users/{username}
  // is checked independently on the backend.
  if (favoritesError) {
    return (
      <div className="p-6 text-center space-y-2">
        <p className="text-lg font-medium">Oops</p>
        <p className="text-muted-foreground">
          {favoritesError instanceof Error ? favoritesError.message : "Something went wrong"}
        </p>
      </div>
    )
  }

  const favList: SharedFavorite[] = favorites ?? []
  const watchlistItems = watchlist?.items ?? []

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      <h1 className="text-xl font-semibold">{username}</h1>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Favorites</h2>
          <Link href={`/u/${username}/favorites`} className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>

        {favList.length === 0 ? (
          <p className="text-sm text-muted-foreground">No favorites yet.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {favList.slice(0, 10).map((fav, index) => (
              <div key={fav.id} className="aspect-2/3 rounded overflow-hidden bg-muted">
                {fav.record.poster_url ? (
                  <Image
                    src={fav.record.poster_url}
                    alt={fav.record.title}
                    width={120}
                    height={180}
                    className="object-cover w-full h-full"
                    priority={index === 0}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-xs text-muted-foreground text-center px-1">
                    No Image
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Watchlist</h2>
          <Link href={`/u/${username}/watchlist`} className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>

        {watchlistError ? (
          <p className="text-sm text-muted-foreground">
            {watchlistError instanceof Error ? watchlistError.message : "Failed to load watchlist"}
          </p>
        ) : watchlistItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">Watchlist is empty.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {watchlistItems.map((record, index) => (
              <div key={record.id} className="aspect-2/3 rounded overflow-hidden bg-muted">
                {record.poster_url ? (
                  <Image
                    src={record.poster_url}
                    alt={record.title}
                    width={120}
                    height={180}
                    className="object-cover w-full h-full"
                    priority={index === 0}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-xs text-muted-foreground text-center px-1">
                    No Image
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Recent Activity</h2>
        <UserActivityFeed username={username} />
      </section>
    </div>
  )
}
