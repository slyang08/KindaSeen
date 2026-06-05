// apps/web/src/features/reviews/ReviewSection.tsx
"use client"

import type { ReviewResponse } from "@kindaseen/shared"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  useCreateReview,
  useDeleteReview,
  useReview,
  useUpdateReview,
} from "@/features/reviews/queries"

type Props = {
  recordId: string
}

type FormState = {
  title: string
  content: string
}

export function ReviewSection({ recordId }: Props) {
  const { data: review, isLoading } = useReview(recordId)
  const createReview = useCreateReview(recordId)
  const updateReview = useUpdateReview(recordId)
  const deleteReview = useDeleteReview(recordId)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<FormState>({ title: "", content: "" })

  const handleCreateReview = () => {
    setForm({ title: "", content: "" })
    setEditing(true)
  }

  const handleEdit = (r: ReviewResponse) => {
    setForm({ title: r.title, content: r.content })
    setEditing(true)
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) return

    if (review) {
      await updateReview.mutateAsync({ reviewId: review.id, data: form })
    } else {
      await createReview.mutateAsync(form)
    }
    setEditing(false)
  }

  const handleDelete = async () => {
    if (!review) return
    await deleteReview.mutateAsync(review.id)
  }

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading review...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Review</h2>
        {!editing && !review && (
          <Button variant="outline" size="sm" onClick={handleCreateReview}>
            Write a review
          </Button>
        )}
      </div>

      {/* Edit / Create form */}
      {editing && (
        <div className="space-y-3 border rounded-lg p-4">
          <Input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Textarea
            placeholder="Write your review..."
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            rows={5}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={createReview.isPending || updateReview.isPending}
            >
              {review ? "Save" : "Publish"}
            </Button>
          </div>
        </div>
      )}

      {/* Display review */}
      {review && !editing && (
        <div className="border rounded-lg p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium">{review.title}</h3>
            <div className="flex gap-2 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-0.5 rounded hover:bg-muted transition-colors">
                    <MoreVertical className="size-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(review)}>
                    <Pencil className="mr-2 size-4" />
                    Edit
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={deleteReview.isPending}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {review.rating != null && (
            <p className="text-sm text-muted-foreground">★ {review.rating}/10</p>
          )}
          <p className="text-sm whitespace-pre-wrap">{review.content}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(review.created_at).getTime() !== new Date(review.updated_at).getTime()
              ? `Edited on ${new Date(review.updated_at).toLocaleDateString()}`
              : `Reviewed on ${new Date(review.created_at).toLocaleDateString()}`}
          </p>
        </div>
      )}
    </div>
  )
}
