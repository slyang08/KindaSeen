// apps/web/src/lib/records.ts
import type { Record, RecordCreate, RecordUpdate } from "@kindaseen/shared"

import { supabase } from "@/lib/supabase"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

async function getToken(): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session) return null

  // If token expires in 60 seconds, refresh it
  const expiresAt = data.session.expires_at ?? 0
  const now = Math.floor(Date.now() / 1000)

  if (expiresAt - now < 60) {
    const { data: refreshed } = await supabase.auth.refreshSession()
    return refreshed.session?.access_token ?? null
  }

  return data.session.access_token
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getToken()

  if (!token) {
    await supabase.auth.signOut()
    window.location.href = "/login"
    throw new Error("No token")
  }

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  })

  if (res.status === 401) {
    await supabase.auth.signOut()
    window.location.href = "/login"
    throw new Error("Unauthorized")
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }))
    throw new Error(error.detail ?? "Request failed")
  }

  if (res.status === 204) return null
  return res.json()
}

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
