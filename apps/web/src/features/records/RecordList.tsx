// apps/web/src/features/records/RecordList.tsx
"use client"

import { MEDIA_TYPE_LABELS, type Record as MediaRecord, STATUS_LABELS } from "@kindaseen/shared"
import { SlidersHorizontal } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useFavorites } from "@/features/favorites"
import { RecordCard } from "@/features/records/RecordCard"

type SortKey = "created_at_desc" | "created_at_asc" | "rating_desc" | "rating_asc" | "title_asc"

type Props = {
  records: MediaRecord[]
  onEdit: (record: MediaRecord) => void
  onDelete: (id: string) => void
}

function FilterControls({
  statusFilter,
  setStatusFilter,
  mediaTypeFilter,
  setMediaTypeFilter,
  genreFilter,
  setGenreFilter,
  sortKey,
  setSortKey,
  allGenres,
}: {
  statusFilter: string
  setStatusFilter: (v: string) => void
  mediaTypeFilter: string
  setMediaTypeFilter: (v: string) => void
  genreFilter: string
  setGenreFilter: (v: string) => void
  sortKey: SortKey
  setSortKey: (v: SortKey) => void
  allGenres: string[]
}) {
  return (
    <>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="sm:w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {Object.entries(STATUS_LABELS)
            .filter(([value]) => value !== "want_to_watch")
            .map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      <Select value={mediaTypeFilter} onValueChange={setMediaTypeFilter}>
        <SelectTrigger className="sm:w-36">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {Object.entries(MEDIA_TYPE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {allGenres.length > 0 && (
        <Select value={genreFilter} onValueChange={setGenreFilter}>
          <SelectTrigger className="sm:w-36">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {allGenres.map((genre) => (
              <SelectItem key={genre} value={genre}>
                {genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
        <SelectTrigger className="sm:w-40">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="created_at_desc">Newest First</SelectItem>
          <SelectItem value="created_at_asc">Oldest First</SelectItem>
          <SelectItem value="rating_desc">Highest Rated</SelectItem>
          <SelectItem value="rating_asc">Lowest Rated</SelectItem>
          <SelectItem value="title_asc">Title A→Z</SelectItem>
        </SelectContent>
      </Select>
    </>
  )
}

export function RecordList({ records, onEdit, onDelete }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>("all")
  const [genreFilter, setGenreFilter] = useState<string>("all")
  const [sortKey, setSortKey] = useState<SortKey>("created_at_desc")
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [showWantToWatch, setShowWantToWatch] = useState(false)
  const { data: favorites } = useFavorites()
  const favoriteIds = useMemo(() => new Set(favorites?.map((f) => f.record_id) ?? []), [favorites])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const allGenres = useMemo(() => {
    const set = new Set<string>()
    records.forEach((r) => r.genres?.forEach((g) => set.add(g)))
    return Array.from(set).sort()
  }, [records])

  const filtered = useMemo(() => {
    return records
      .filter((r) => showWantToWatch || r.status !== "want_to_watch")
      .filter((r) => !showFavoritesOnly || favoriteIds.has(r.id))
      .filter((r) => statusFilter === "all" || r.status === statusFilter)
      .filter((r) => mediaTypeFilter === "all" || r.media_type === mediaTypeFilter)
      .filter((r) => genreFilter === "all" || r.genres?.includes(genreFilter))
      .sort((a, b) => {
        switch (sortKey) {
          case "created_at_asc":
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          case "created_at_desc":
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          case "rating_desc":
            return (b.rating ?? -1) - (a.rating ?? -1)
          case "rating_asc":
            return (a.rating ?? 11) - (b.rating ?? 11)
          case "title_asc":
            return a.title.localeCompare(b.title)
        }
      })
  }, [
    records,
    showWantToWatch,
    showFavoritesOnly,
    favoriteIds,
    statusFilter,
    mediaTypeFilter,
    genreFilter,
    sortKey,
  ])

  const activeFilterCount = [
    statusFilter !== "all",
    mediaTypeFilter !== "all",
    genreFilter !== "all",
  ].filter(Boolean).length

  const filterProps = {
    statusFilter,
    setStatusFilter,
    mediaTypeFilter,
    setMediaTypeFilter,
    genreFilter,
    setGenreFilter,
    sortKey,
    setSortKey,
    allGenres,
  }

  const watchlistToggle = (
    <button
      onClick={() => setShowWantToWatch(!showWantToWatch)}
      className={`text-sm border rounded px-3 py-1.5 transition-colors whitespace-nowrap ${
        showWantToWatch
          ? "bg-primary text-primary-foreground border-primary"
          : "text-muted-foreground border-input"
      }`}
    >
      {showWantToWatch ? "Hiding Watchlist" : "Show Watchlist"}
    </button>
  )

  const favoritesToggle = (
    <button
      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
      className={`text-sm border rounded px-3 py-1.5 transition-colors whitespace-nowrap ${
        showFavoritesOnly
          ? "bg-primary text-primary-foreground border-primary"
          : "text-muted-foreground border-input"
      }`}
    >
      {showFavoritesOnly ? "Favorites Only" : "Show Favorites"}
    </button>
  )

  return (
    <div className="space-y-4">
      {/* Desktop filters */}
      <div className="hidden sm:flex sm:flex-wrap sm:items-center gap-2">
        <FilterControls {...filterProps} />
        {watchlistToggle}
        {favoritesToggle}
      </div>

      {/* Mobile filter button */}
      <div className="flex items-center gap-2 sm:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilterDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="size-4" />
          Filter & Sort
          {activeFilterCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
        {watchlistToggle}
        {favoritesToggle}
      </div>

      {/* Mobile filter dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Filter & Sort</DialogTitle>
            <DialogDescription>Filter and sort your records.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <FilterControls {...filterProps} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {records.length === 0
            ? "No records yet. Add your first one!"
            : "No records match your filters."}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((record, index) => (
            <RecordCard
              key={record.id}
              record={record}
              onEdit={onEdit}
              onDelete={onDelete}
              priority={index === 0}
              isFavorite={favoriteIds.has(record.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
