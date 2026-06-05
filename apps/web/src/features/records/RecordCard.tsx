// apps/web/src/features/records/RecordCard.tsx
"use client"

import {
  MEDIA_TYPE_LABELS,
  type Record as MediaRecord,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@kindaseen/shared"
import { Heart, MoreVertical } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToggleFavorite } from "@/features/favorites"

type Props = {
  record: MediaRecord
  priority?: boolean
  isFavorite?: boolean
}

export function RecordCard({ record, priority, isFavorite = false }: Props) {
  const [expanded, setExpanded] = useState(false)
  const { mutate: toggleFavorite } = useToggleFavorite()

  const title = record.release_year ? `${record.title} (${record.release_year})` : record.title

  const statusColor = STATUS_COLORS[record.status] ?? "text-muted-foreground"

  const watchMeta = [
    record.season > 1 ? `S${record.season}` : null,
    record.episode != null ? `EP ${record.episode}` : null,
    record.rating != null ? `★ ${record.rating}/10` : null,
  ]
    .filter(Boolean)
    .join(" · ")

  const displayText = record.notes?.trim()
    ? record.notes
    : record.overview?.trim()
      ? record.overview
      : null

  return (
    <div className="flex items-start gap-3 p-4 border rounded-lg">
      {/* Poster */}
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

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Row 1: Title + Media Type badge + ... menu */}
        <div className="flex items-start justify-between gap-2">
          <Link href={`/records/${record.id}`} className="font-medium leading-snug hover:underline">
            {title}
          </Link>
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
                <DropdownMenuItem
                  onClick={() => toggleFavorite({ record_id: record.id, isFavorite })}
                >
                  <Heart
                    className={`size-4 mr-2 ${isFavorite ? "fill-current text-red-500" : ""}`}
                  />
                  {isFavorite ? "Unfavorite" : "Favorite"}
                </DropdownMenuItem>
                {/* {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(record)}>
                    <Pencil className="size-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(record.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )} */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Row 2: Status (colored) + watch meta */}
        <p className="text-sm">
          <span className={statusColor}>{STATUS_LABELS[record.status]}</span>
          {watchMeta && <span className="text-muted-foreground"> · {watchMeta}</span>}
        </p>

        {/* Row 3: Genres */}
        {record.genres && record.genres.length > 0 && (
          <div className="flex flex-wrap gap-x-2 gap-y-0.5">
            {record.genres.map((genre) => (
              <span key={genre} className="text-xs text-muted-foreground">
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Row 4: Note / Overview */}
        {displayText && (
          <div>
            <p
              className={
                expanded
                  ? "text-xs text-muted-foreground/70"
                  : "text-xs text-muted-foreground/70 line-clamp-1 sm:line-clamp-2"
              }
            >
              {displayText}
            </p>
            {displayText.length > 80 && (
              <button
                onClick={() => setExpanded((prev) => !prev)}
                className="text-xs text-muted-foreground underline mt-0.5"
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
