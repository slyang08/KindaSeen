// apps/web/src/features/reviews/CommentSection.tsx
"use client"

import type { CommentResponse } from "@kindaseen/shared"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  useCreateComment,
  useDeleteComment,
  useReview,
  useUpdateComment,
} from "@/features/reviews/queries"

type Props = {
  recordId: string
}

export function CommentSection({ recordId }: Props) {
  const { data: review } = useReview(recordId)
  const createComment = useCreateComment(recordId)
  const updateComment = useUpdateComment(recordId)
  const deleteComment = useDeleteComment(recordId)

  const [newContent, setNewContent] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  if (!review) return null

  const handleCreate = async () => {
    if (!newContent.trim()) return
    await createComment.mutateAsync({ reviewId: review.id, data: { content: newContent } })
    setNewContent("")
  }

  const handleStartEdit = (comment: CommentResponse) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const handleUpdate = async (commentId: string) => {
    if (!editContent.trim()) return
    await updateComment.mutateAsync({ commentId, data: { content: editContent } })
    setEditingId(null)
  }

  const handleDelete = async (commentId: string) => {
    await deleteComment.mutateAsync(commentId)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Comments</h2>

      {/* Comment list */}
      {review.comments.length > 0 ? (
        <div className="space-y-3">
          {review.comments.map((comment) => (
            <div key={comment.id} className="border rounded-lg p-3 space-y-2">
              {editingId === comment.id ? (
                <>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUpdate(comment.id)}
                      disabled={updateComment.isPending}
                    >
                      Save
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleStartEdit(comment)}>
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(comment.id)}
                        disabled={deleteComment.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      )}

      {/* New comment */}
      <div className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          rows={3}
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={!newContent.trim() || createComment.isPending}
          >
            Add Comment
          </Button>
        </div>
      </div>
    </div>
  )
}
