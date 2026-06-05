// apps/web/src/features/records/queries.ts
import type { Record as MediaRecord, RecordCreate, RecordUpdate } from "@kindaseen/shared"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { recordsApi } from "@/lib/records"

export const recordKeys = {
  all: ["records"] as const,
  deleted: ["records", "deleted"] as const,
  detail: (id: string) => ["records", id] as const,
}

export function useRecords(enabled = true) {
  return useQuery({
    queryKey: recordKeys.all,
    queryFn: () => recordsApi.getAll(),
    enabled,
  })
}

export function useRecord(id: string, enabled = true) {
  return useQuery({
    queryKey: recordKeys.detail(id),
    queryFn: () => recordsApi.getById(id),
    enabled: enabled ?? !!id,
  })
}

export function useDeletedRecords(enabled = true) {
  return useQuery({
    queryKey: recordKeys.deleted,
    queryFn: () => recordsApi.getDeleted(),
    enabled,
  })
}

export function useCreateRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: RecordCreate) => recordsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recordKeys.all }),
  })
}

export function useUpdateRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RecordUpdate }) => recordsApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recordKeys.all }),
  })
}

export function useDeleteRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => recordsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recordKeys.all }),
  })
}

export function useRestoreRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => recordsApi.restore(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: recordKeys.deleted })
      await queryClient.cancelQueries({ queryKey: recordKeys.all })

      const previousDeleted = queryClient.getQueryData(recordKeys.deleted)
      const previousAll = queryClient.getQueryData(recordKeys.all)

      // Find the record in the deleted list
      const record = ((previousDeleted as MediaRecord[]) ?? []).find((r) => r.id === id)

      // Remove from deleted
      queryClient.setQueryData(recordKeys.deleted, (old: MediaRecord[] = []) =>
        old.filter((r) => r.id !== id)
      )

      // Add to all
      if (record) {
        queryClient.setQueryData(recordKeys.all, (old: MediaRecord[] = []) => [record, ...old])
      }

      return { previousDeleted, previousAll }
    },
    onError: (_err, _id, context) => {
      // If it fails, rollback
      if (context?.previousDeleted) {
        queryClient.setQueryData(recordKeys.deleted, context.previousDeleted)
      }
      if (context?.previousAll) {
        queryClient.setQueryData(recordKeys.all, context.previousAll)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: recordKeys.deleted })
      queryClient.invalidateQueries({ queryKey: recordKeys.all })
    },
  })
}

export function usePermanentDeleteRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => recordsApi.permanentDelete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recordKeys.deleted }),
  })
}
