// apps/web/src/lib/records.ts
import type { Record, RecordCreate, RecordUpdate } from "@kindaseen/shared"

import { fetchWithAuth } from "@/lib/api"

export const recordsApi = {
  getAll: (): Promise<Record[]> => fetchWithAuth("/records/"),

  getById: (id: string): Promise<Record> => fetchWithAuth(`/records/${id}`),

  getDeleted: (): Promise<Record[]> => fetchWithAuth("/records/trash"),

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
}
