// apps/web/src/features/records/GenresField.tsx
"use client"

import { X } from "lucide-react"
import { useRef, useState } from "react"

import { Input } from "@/components/ui"
import { Label } from "@/components/ui/label"

type Props = {
  value: string[]
  onChange: (genres: string[]) => void
  fromTMDB: boolean
  hasTMDBGenres: boolean
}

export function GenresField({ value, onChange, fromTMDB, hasTMDBGenres }: Props) {
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const add = (genre: string) => {
    const trimmed = genre.trim()
    if (!trimmed || value.includes(trimmed)) return
    onChange([...value, trimmed])
    setInput("")
  }

  const remove = (genre: string) => {
    onChange(value.filter((g) => g !== genre))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      add(input)
    }
    if (e.key === "Backspace" && input === "" && value.length > 0) {
      remove(value[value.length - 1])
    }
  }

  return (
    <div className="space-y-1.5">
      <Label>Genres</Label>

      {/* From TMDB but no genres */}
      {fromTMDB && !hasTMDBGenres && (
        <p className="text-xs text-muted-foreground">
          No genres from TMDB — you can add them manually.
        </p>
      )}

      {/* Tag chips + input */}
      <div
        className="flex flex-wrap gap-1.5 min-h-9 w-full rounded-md border border-input bg-background px-3 py-2 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((genre) => (
          <span
            key={genre}
            className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-sm"
          >
            {genre}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                remove(genre)
              }}
              className="rounded-full hover:bg-muted-foreground/20 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (input) add(input)
          }}
          placeholder={value.length === 0 ? "Type and press Enter..." : ""}
          className={`flex-1 min-w-20 bg-transparent text-sm border-0 ring-0 focus-visible:ring-0
                      outline-none placeholder:text-muted-foreground`}
        />
      </div>
      <p className="text-xs text-muted-foreground">Press Enter or comma to add</p>
    </div>
  )
}
