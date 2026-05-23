// apps/web/src/features/records/RecordList.tsx
import { MEDIA_TYPE_LABELS, type Record as MediaRecord, STATUS_LABELS } from "@kindaseen/shared"
import { useMemo, useState } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RecordCard } from "@/features/records/RecordCard"

type SortKey = "created_at_desc" | "created_at_asc" | "rating_desc" | "rating_asc" | "title_asc"

type Props = {
  records: MediaRecord[]
  onEdit: (record: MediaRecord) => void
  onDelete: (id: string) => void
}

export function RecordList({ records, onEdit, onDelete }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>("all")
  const [genreFilter, setGenreFilter] = useState<string>("all")
  const [sortKey, setSortKey] = useState<SortKey>("created_at_desc")

  // Collect all unique genres from records
  const allGenres = useMemo(() => {
    const set = new Set<string>()
    records.forEach((r) => r.genres?.forEach((g) => set.add(g)))
    return Array.from(set).sort()
  }, [records])

  const filtered = useMemo(() => {
    return records
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
  }, [records, statusFilter, mediaTypeFilter, genreFilter, sortKey])

  return (
    <div className="space-y-4">
      {/* Filters + Sort */}
      <div className="flex flex-wrap gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={mediaTypeFilter} onValueChange={setMediaTypeFilter}>
          <SelectTrigger className="w-36">
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
            <SelectTrigger className="w-36">
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
          <SelectTrigger className="w-40">
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
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {records.length === 0
            ? "No records yet. Add your first one!"
            : "No records match your filters."}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((record) => (
            <RecordCard key={record.id} record={record} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
