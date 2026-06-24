// apps/web/src/lib/feed.ts
import type { FeedResponse } from "@kindaseen/shared"

import { fetchWithAuth } from "@/lib/api"

export async function getFeed(limit = 20, before_id?: string): Promise<FeedResponse> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (before_id) params.set("before_id", before_id)
  return fetchWithAuth(`/feed/me?${params}`)
}

export async function getUserFeed(
  username: string,
  limit = 20,
  before_id?: string
): Promise<FeedResponse> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (before_id) params.set("before_id", before_id)
  try {
    return await fetchWithAuth(`/feed/users/${username}?${params}`)
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.toLowerCase().includes("private")) {
        throw new Error("This user's activity is not public")
      }
      if (err.message.toLowerCase().includes("not found")) {
        throw new Error("User not found")
      }
    }
    throw err
  }
}

export async function getUserActivities(
  username: string,
  limit = 20,
  before_id?: string
): Promise<FeedResponse> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (before_id) params.set("before_id", before_id)
  return fetchWithAuth(`/feed/users/${username}?${params}`)
}
