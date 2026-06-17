// apps/web/src/features/records/queries.ts
import type { RecordCreate, RecordUpdate } from "@kindaseen/shared"
import { GetRecordsParams } from "@kindaseen/shared"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { recordsApi } from "@/lib/records"

export const recordKeys = {
  all: ["records"] as const,
  lists: () => [...recordKeys.all, "list"] as const,
  list: (params: GetRecordsParams) => [...recordKeys.lists(), params] as const,
  deleted: ["records", "deleted"] as const,
  detail: (id: string) => ["records", id] as const,
}

export function useRecords(params: GetRecordsParams, enabled = true) {
  return useInfiniteQuery({
    queryKey: recordKeys.list(params),
    queryFn: ({ pageParam = 0 }) => recordsApi.getAll({ ...params, limit: 20, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.has_more) return undefined
      return lastPage.offset + lastPage.limit
    },
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

export function useWatchlist(enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ["records", "watchlist"],
    queryFn: ({ pageParam }) => recordsApi.getWatchlist(20, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.has_more) return undefined
      return allPages.length * 20
    },
    enabled,
  })
}

export function useDeletedRecords(enabled = true) {
  return useInfiniteQuery({
    queryKey: recordKeys.deleted,
    queryFn: ({ pageParam = 0 }) => recordsApi.getDeleted({ limit: 20, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.has_more) return undefined
      return lastPage.offset + lastPage.limit
    },
    enabled,
  })
}

export function useCreateRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: RecordCreate) => recordsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recordKeys.lists() }),
  })
}

export function useUpdateRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RecordUpdate }) => recordsApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recordKeys.lists() }),
  })
}

export function useDeleteRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => recordsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recordKeys.lists() }),
  })
}

export function useRestoreRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => recordsApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recordKeys.deleted })
      queryClient.invalidateQueries({ queryKey: recordKeys.lists() })
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
