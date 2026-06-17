// apps/web/src/features/records/RecordList.tsx
"use client"

import {
  GetRecordsParams,
  MEDIA_TYPE_LABELS,
  type Record as MediaRecord,
  RecordSortBy,
  SortOrder,
  STATUS_LABELS,
} from "@kindaseen/shared"
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

type Props = {
  records: MediaRecord[]
  total: number
  filterParams: GetRecordsParams
  onFilterChange: (params: GetRecordsParams) => void
}

function FilterControls({
  filterParams,
  onFilterChange,
}: {
  filterParams: GetRecordsParams
  onFilterChange: (params: GetRecordsParams) => void
}) {
  const sortValue =
    filterParams.sort_by && filterParams.sort_order
      ? `${filterParams.sort_by}_${filterParams.sort_order}`
      : "create_at_desc"

  const handleSortChange = (value: string) => {
    const lastUnderscore = value.lastIndexOf("_")
    const sort_by = value.slice(0, lastUnderscore) as RecordSortBy
    const sort_order = value.slice(lastUnderscore + 1) as SortOrder
    onFilterChange({ ...filterParams, sort_by, sort_order })
  }

  return (
    <>
      <Select
        value={filterParams.status ?? "all"}
        onValueChange={(v) =>
          onFilterChange({ ...filterParams, status: v === "all" ? undefined : v })
        }
      >
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

      <Select
        value={filterParams.media_type}
        onValueChange={(v) =>
          onFilterChange({ ...filterParams, media_type: v === "all" ? undefined : v })
        }
      >
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

      <Select value={sortValue} onValueChange={handleSortChange}>
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

export function RecordList({ records, total, filterParams, onFilterChange }: Props) {
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const { data: favorites } = useFavorites()
  const favoriteIds = useMemo(() => new Set(favorites?.map((f) => f.record_id) ?? []), [favorites])

  const activeFilterCount = [!!filterParams.status, !!filterParams.media_type].filter(
    Boolean
  ).length

  // Favorites filter stays client-side — it's a join with a separate query,
  // not worth a backend round-trip
  const displayed = showFavoritesOnly ? records.filter((r) => favoriteIds.has(r.id)) : records

  const filterProps = { filterParams, onFilterChange }

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

      {/* Results count */}
      {total > 0 && <p className="text-sm text-muted-foreground">{total} records</p>}

      {/* Results */}
      {displayed.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {records.length === 0
            ? "No records yet. Add your first one!"
            : "No records match your filters."}
        </p>
      ) : (
        <div className="space-y-3">
          {displayed.map((record, index) => (
            <RecordCard
              key={record.id}
              record={record}
              priority={index === 0}
              isFavorite={favoriteIds.has(record.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
