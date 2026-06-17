// apps/web/src/lib/records.ts
import type {
  GetRecordsParams,
  PaginatedRecordResponse,
  Record,
  RecordCreate,
  RecordUpdate,
} from "@kindaseen/shared"

import { fetchWithAuth } from "@/lib/api"

export const recordsApi = {
  getAll: (params: GetRecordsParams = {}): Promise<PaginatedRecordResponse> => {
    const searchParams = new URLSearchParams()
    if (params.limit) searchParams.set("limit", String(params.limit))
    if (params.offset) searchParams.set("offset", String(params.offset))
    if (params.media_type) searchParams.set("media_type", params.media_type)
    if (params.status) searchParams.set("status", params.status)
    if (params.sort_by) searchParams.set("sort_by", params.sort_by)
    if (params.sort_order) searchParams.set("sort_order", params.sort_order)
    return fetchWithAuth(`/records/?${searchParams}`)
  },

  getById: (id: string): Promise<Record> => fetchWithAuth(`/records/${id}`),

  getWatchlist(limit = 20, offset = 0): Promise<PaginatedRecordResponse> {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
    return fetchWithAuth(`/records/watchlist?${params}`)
  },

  getDeleted: (
    params: Pick<GetRecordsParams, "limit" | "offset"> = {}
  ): Promise<PaginatedRecordResponse> => {
    const searchParams = new URLSearchParams()
    if (params.limit) searchParams.set("limit", String(params.limit))
    if (params.offset) searchParams.set("offset", String(params.offset))
    return fetchWithAuth(`/records/trash?${searchParams}`)
  },

  create: (data: RecordCreate): Promise<Record> =>
    fetchWithAuth("/records/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: RecordUpdate): Promise<Record> =>
    fetchWithAuth(`/records/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<null> => fetchWithAuth(`/records/${id}`, { method: "DELETE" }),

  restore: (id: string): Promise<Record> =>
    fetchWithAuth(`/records/${id}/restore`, { method: "PATCH" }),

  permanentDelete: (id: string) => fetchWithAuth(`/records/${id}/permanent`, { method: "DELETE" }),
}
