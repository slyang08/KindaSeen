// apps/web/src/lib/feed.ts
import { Activity } from "@kindaseen/shared"

import { fetchWithAuth } from "./api"

export async function getFeed(limit = 20, offset = 0): Promise<Activity[]> {
  return fetchWithAuth(`/feed/me?limit=${limit}&offset=${offset}`)
}

export async function getUserActivities(
  username: string,
  limit = 20,
  offset = 0
): Promise<Activity[]> {
  return fetchWithAuth(`/feed/users/${username}?limit=${limit}&offset=${offset}`)
}
