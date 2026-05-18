// apps/web/src/components/records/RecordFormDialog.tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  MEDIA_TYPES,
  type MediaType,
  type Record as MediaRecord,
  type RecordCreate,
  type Status,
  STATUSES,
} from "@kindaseen/shared"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const MEDIA_TYPE_LABELS: Record<string, string> = {
  movie: "Movie",
  variety: "Variety Show",
  drama: "Drama",
  anime: "Anime",
  manga: "Manga",
  novel: "Novel",
  podcast: "Podcast",
}

const STATUS_LABELS: Record<string, string> = {
  completed: "Completed",
  watching: "Watching",
  dropped: "Dropped",
  want_to_watch: "Want to Watch",
}

const SEASON_SUPPORTED: MediaType[] = ["drama", "anime", "variety", "podcast"]
const EPISODE_SUPPORTED: MediaType[] = ["drama", "anime", "variety", "manga", "podcast"]

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  media_type: z.enum([...MEDIA_TYPES], { required_error: "Media type is required" }),
  status: z.enum([...STATUSES], { required_error: "Status is required" }),
  season: z.number().min(1).nullable().optional(),
  episode: z.number().min(1).nullable().optional(),
  rating: z.number().min(1).max(10).nullable().optional(),
  notes: z.string().nullable().optional(),
})

type FormValues = {
  title: string
  media_type: MediaType
  status: Status
  season: number | null | undefined
  episode: number | null | undefined
  rating: number | null | undefined
  notes: string | null | undefined
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: RecordCreate) => Promise<void>
  defaultValues?: MediaRecord
  mode: "create" | "edit"
}

export function RecordFormDialog({ open, onOpenChange, onSubmit, defaultValues, mode }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: defaultValues?.title ?? "",
      media_type: defaultValues?.media_type,
      status: defaultValues?.status,
      season: defaultValues?.season ?? null,
      episode: defaultValues?.episode ?? null,
      rating: defaultValues?.rating ?? null,
      notes: defaultValues?.notes ?? "",
    },
  })

  const selectedMediaType = useWatch({ control, name: "media_type" })
  const showSeason = selectedMediaType && SEASON_SUPPORTED.includes(selectedMediaType)
  const showEpisode = selectedMediaType && EPISODE_SUPPORTED.includes(selectedMediaType)

  const onFormSubmit = async (values: FormValues) => {
    await onSubmit({
      title: values.title,
      media_type: values.media_type,
      status: values.status,
      season: values.season ?? null,
      episode: values.episode ?? null,
      rating: values.rating ?? null,
      notes: values.notes ?? null,
    })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Record" : "Edit Record"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Enter title" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>Media Type</Label>
            <Select
              defaultValue={defaultValues?.media_type}
              onValueChange={(val) => setValue("media_type", val as FormValues["media_type"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select media type" />
              </SelectTrigger>
              <SelectContent>
                {MEDIA_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {MEDIA_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.media_type && (
              <p className="text-sm text-destructive">{errors.media_type.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Status</Label>
            <Select
              defaultValue={defaultValues?.status}
              onValueChange={(val) => setValue("status", val as FormValues["status"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
          </div>

          {showSeason && (
            <div className="space-y-1">
              <Label htmlFor="season">Season</Label>
              <Input
                id="season"
                type="number"
                min={1}
                placeholder="Optional"
                {...register("season", {
                  setValueAs: (v) => (v === "" ? null : Number(v)),
                })}
              />
              {errors.season && <p className="text-sm text-destructive">{errors.season.message}</p>}
            </div>
          )}

          {showEpisode && (
            <div className="space-y-1">
              <Label htmlFor="episode">
                {selectedMediaType === "manga" ? "Chapter" : "Episode"}
              </Label>
              <Input
                id="episode"
                type="number"
                min={1}
                placeholder="Optional"
                {...register("episode", {
                  setValueAs: (v) => (v === "" ? null : Number(v)),
                })}
              />
              {errors.episode && (
                <p className="text-sm text-destructive">{errors.episode.message}</p>
              )}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="rating">Rating (1-10)</Label>
            <Input
              id="rating"
              type="number"
              min={1}
              max={10}
              placeholder="Optional"
              {...register("rating", {
                setValueAs: (v) => (v === "" ? null : Number(v)),
              })}
            />
            {errors.rating && <p className="text-sm text-destructive">{errors.rating.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Optional" {...register("notes")} />
            {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "create" ? "Add" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
