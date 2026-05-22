// apps/web/src/features/records/RecordFormDialog.tsx
"use client"

import { type RecordCreate } from "@kindaseen/shared"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { RecordForm } from "./RecordForm"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  readonlyTitle?: boolean
  initialValues?: Partial<RecordCreate>
  onSubmit: (data: RecordCreate) => Promise<void>
}

export function RecordFormDialog({
  open,
  onOpenChange,
  title,
  readonlyTitle,
  initialValues,
  onSubmit,
}: Props) {
  const fromTMDB = !!initialValues?.tmdb_id
  const hasTMDBGenres = !!(initialValues?.genres && initialValues.genres.length > 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Create or edit your record</DialogDescription>
        </DialogHeader>

        <RecordForm
          initialValues={
            initialValues
              ? {
                  ...initialValues,
                  genres: initialValues.genres ?? [],
                }
              : undefined
          }
          onSubmit={async (data) => {
            await onSubmit(data)
            onOpenChange(false)
          }}
          readonlyTitle={readonlyTitle}
          fromTMDB={fromTMDB}
          hasTMDBGenres={hasTMDBGenres}
        />
      </DialogContent>
    </Dialog>
  )
}
