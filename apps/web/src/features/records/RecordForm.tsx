// apps/web/src/features/records/RecordForm.tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  MEDIA_TYPES,
  type MediaType,
  type RecordCreate,
  type Status,
  STATUSES,
} from "@kindaseen/shared"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

import { GenresField } from "./GenresField"

const schema = z.object({
  title: z.string().min(1),
  media_type: z.enum([...MEDIA_TYPES]),
  status: z.enum([...STATUSES]),
  release_year: z.number().nullable().optional(),
  season: z.number().min(1, "at least to be 1"),
  episode: z.number().min(1, "at least to be 1"),
  rating: z.number().nullable().optional(),
  genres: z.array(z.string()).default([]),
  notes: z.string().nullable().optional(),
  tmdb_id: z.number().nullable().optional(),
  poster_url: z.string().nullable().optional(),
  overview: z.string().nullable().optional(),
  tmdb_rating: z.number().nullable().optional(),
})

export type RecordFormValues = z.infer<typeof schema>

type Props = {
  initialValues?: Partial<RecordFormValues>
  onSubmit: (data: RecordCreate) => Promise<void>
  readonlyTitle?: boolean
  submitLabel?: string
  fromTMDB?: boolean
  hasTMDBGenres?: boolean
}

export function RecordForm({
  initialValues,
  onSubmit,
  readonlyTitle = false,
  submitLabel = "Save",
  fromTMDB,
  hasTMDBGenres,
}: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialValues?.title ?? "",
      media_type: initialValues?.media_type,
      status: initialValues?.status,
      release_year: initialValues?.release_year ?? null,
      season: initialValues?.season ?? 1,
      episode: initialValues?.episode ?? 1,
      rating: initialValues?.rating ?? null,
      genres: initialValues?.genres ?? [],
      notes: initialValues?.notes ?? "",
      tmdb_id: initialValues?.tmdb_id ?? null,
      poster_url: initialValues?.poster_url ?? null,
      overview: initialValues?.overview ?? null,
      tmdb_rating: initialValues?.tmdb_rating ?? null,
    },
  })

  useEffect(() => {
    reset({
      title: initialValues?.title ?? "",
      media_type: initialValues?.media_type,
      status: initialValues?.status,
      release_year: initialValues?.release_year ?? null,
      season: initialValues?.season ?? 1,
      episode: initialValues?.episode ?? 1,
      rating: initialValues?.rating ?? null,
      genres: initialValues?.genres ?? [],
      notes: initialValues?.notes ?? "",
      tmdb_id: initialValues?.tmdb_id ?? null,
      poster_url: initialValues?.poster_url ?? null,
      overview: initialValues?.overview ?? null,
      tmdb_rating: initialValues?.tmdb_rating ?? null,
    })
  }, [initialValues, reset])

  const mediaType = useWatch({ control, name: "media_type" })

  const showSeason =
    mediaType === "drama" ||
    mediaType === "anime" ||
    mediaType === "variety" ||
    mediaType === "podcast"

  const showEpisode =
    mediaType === "drama" ||
    mediaType === "anime" ||
    mediaType === "variety" ||
    mediaType === "manga" ||
    mediaType === "podcast"

  const submit = async (values: RecordFormValues) => {
    await onSubmit({
      title: values.title,
      media_type: values.media_type,
      status: values.status,
      release_year: values.release_year ?? null,
      season: values.season,
      episode: values.episode,
      rating: values.rating ?? null,
      genres: values.genres ?? [],
      notes: values.notes ?? null,
      tmdb_id: values.tmdb_id ?? null,
      poster_url: values.poster_url ?? null,
      overview: values.overview ?? null,
      tmdb_rating: values.tmdb_rating ?? null,
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      {/* Title */}
      <div className="space-y-1">
        <Label>Title</Label>
        <Input {...register("title")} readOnly={readonlyTitle} />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>

      {/* Media Type */}
      <div className="space-y-1">
        <Label>Media Type</Label>
        <Select onValueChange={(value) => setValue("media_type", value as MediaType)}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {MEDIA_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="space-y-1">
        <Label>Status</Label>
        <Select onValueChange={(value) => setValue("status", value as Status)}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Release Year */}
      <div className="space-y-1">
        <Label>Year</Label>
        <Input
          type="number"
          placeholder="e.g. 2004"
          readOnly={!!initialValues?.release_year}
          className={initialValues?.release_year ? "bg-muted text-muted-foreground" : ""}
          {...register("release_year", {
            setValueAs: (v) => (v === "" ? null : Number(v)),
          })}
        />
      </div>

      {/* Season */}
      {showSeason && (
        <div>
          <Label>Season</Label>
          <Input
            type="number"
            min={1}
            placeholder="e.g. 1"
            required
            {...register("season", {
              setValueAs: (value) => (value === "" ? null : Number(value)),
            })}
          />
        </div>
      )}

      {/* Episode */}
      {showEpisode && (
        <div>
          <Label>{mediaType === "manga" ? "Chapter" : "Episode"}</Label>
          <Input
            type="number"
            min={1}
            placeholder="e.g. 1"
            required
            {...register("episode", {
              setValueAs: (value) => (value === "" ? null : Number(value)),
            })}
          />
        </div>
      )}

      {/* Rating */}
      <div>
        <Label>Rating (1-10)</Label>
        <Input
          type="number"
          min={1}
          max={10}
          {...register("rating", {
            setValueAs: (value) => (value === "" ? null : Number(value)),
          })}
        />
      </div>

      {/* Genres */}
      <GenresField
        value={useWatch({ control, name: "genres" }) ?? []}
        onChange={(genres) => setValue("genres", genres)}
        fromTMDB={fromTMDB ?? false}
        hasTMDBGenres={hasTMDBGenres ?? false}
      />

      {/* Notes */}
      <div className="space-y-1">
        <Label>Notes</Label>
        <Textarea {...register("notes")} />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner />
            Saving...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  )
}
