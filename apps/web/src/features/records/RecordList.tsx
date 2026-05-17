// apps/web/src/components/records/RecordList.tsx
import type { Record as MediaRecord } from "@kindaseen/shared"

import { RecordCard } from "@/features/records/RecordCard"

type Props = {
  records: MediaRecord[]
  onEdit: (record: MediaRecord) => void
  onDelete: (id: string) => void
}

export function RecordList({ records, onEdit, onDelete }: Props) {
  if (records.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">No records yet. Add your first one!</p>
    )
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <RecordCard key={record.id} record={record} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
