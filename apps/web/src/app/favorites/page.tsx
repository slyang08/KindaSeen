// apps/web/src/app/favorites/page.tsx
"use client"

import { useMemo } from "react"

import { useFavorites } from "@/features/favorites"
import { RecordCard, useRecords } from "@/features/records"

export default function FavoritesPage() {
  const { data: records } = useRecords()
  const { data: favorites } = useFavorites()

  const favoriteIds = useMemo(() => new Set(favorites?.map((f) => f.record_id) ?? []), [favorites])

  const favoriteRecords = useMemo(
    () => records?.filter((r) => favoriteIds.has(r.id)) ?? [],
    [records, favoriteIds]
  )

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Favorites</h1>
      {favoriteRecords.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No favorites yet.</p>
      ) : (
        <div className="space-y-3">
          {favoriteRecords.map((record, index) => (
            <RecordCard key={record.id} record={record} priority={index === 0} isFavorite={true} />
          ))}
        </div>
      )}
    </div>
  )
}
