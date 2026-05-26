// apps/web/src/features/records/WatchlistCard.tsx
"use client"

import { MEDIA_TYPE_LABELS, type Record as MediaRecord } from "@kindaseen/shared"
import { MoreVertical, Pencil, Play, Trash2 } from "lucide-react"
import Image from "next/image"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Props = {
  record: MediaRecord
  onEdit: (record: MediaRecord) => void
  onDelete: (id: string) => void
  onStartWatching: (id: string) => void
  priority?: boolean
}

export function WatchlistCard({ record, onEdit, onDelete, onStartWatching, priority }: Props) {
  const title = record.release_year ? `${record.title} (${record.release_year})` : record.title

  const displayText = record.notes?.trim()
    ? record.notes
    : record.overview?.trim()
      ? record.overview
      : null

  return (
    <div className="flex items-start gap-3 p-4 border rounded-lg">
      <div className="shrink-0 w-14 h-20 sm:w-16 sm:h-24 rounded overflow-hidden bg-muted flex items-center justify-center">
        {record.poster_url ? (
          <Image
            src={record.poster_url}
            alt={record.title}
            width={64}
            height={96}
            className="object-cover w-full h-full"
            priority={priority}
          />
        ) : (
          <span className="text-xs text-muted-foreground text-center leading-tight px-1">
            No Image Available
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium leading-snug">{title}</p>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs border rounded px-1.5 py-0.5 text-muted-foreground">
              {MEDIA_TYPE_LABELS[record.media_type]}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-0.5 rounded hover:bg-muted transition-colors">
                  <MoreVertical className="size-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(record)}>
                  <Pencil className="size-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(record.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {record.tmdb_rating != null && (
          <p className="text-sm text-muted-foreground">★ {record.tmdb_rating} on TMDB</p>
        )}

        {record.genres && record.genres.length > 0 && (
          <div className="flex flex-wrap gap-x-2 gap-y-0.5">
            {record.genres.map((genre) => (
              <span key={genre} className="text-xs text-muted-foreground">
                {genre}
              </span>
            ))}
          </div>
        )}

        {displayText && (
          <p className="text-xs text-muted-foreground/70 line-clamp-2">{displayText}</p>
        )}

        <button
          onClick={() => onStartWatching(record.id)}
          className="inline-flex items-center gap-1.5 text-xs border rounded px-2.5 py-1 mt-1 hover:bg-muted transition-colors"
        >
          <Play className="size-3" />
          Start watching
        </button>
      </div>
    </div>
  )
}
