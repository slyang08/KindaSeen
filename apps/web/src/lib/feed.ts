// apps/web/src/lib/feed.ts
import type { FeedResponse } from "@kindaseen/shared"

import { fetchWithAuth } from "./api"

export async function getFeed(limit = 20, before_id?: string): Promise<FeedResponse> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (before_id) params.set("before_id", before_id)
  return fetchWithAuth(`/feed/me?${params}`)
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
