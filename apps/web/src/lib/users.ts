// apps/web/src/lib/users.ts
import type { PaginatedRecordResponse, UserProfile, UserProfileUpdate } from "@kindaseen/shared"

import { fetchWithAuth } from "@/lib/api"

export async function getMyProfile(): Promise<UserProfile> {
  return fetchWithAuth("/users/me")
}

export async function updateMyProfile(data: UserProfileUpdate): Promise<UserProfile> {
  return fetchWithAuth("/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function getPublicFavorites(username: string) {
  try {
    return await fetchWithAuth(`/users/u/${username}/favorites`)
  } catch (err) {
    if (err instanceof Error && err.message.includes("private")) {
      throw new Error("This user's favorites are not public")
    }
    throw err
  }
}

export async function getPublicWatchlist(
  username: string,
  limit = 20,
  offset = 0
): Promise<PaginatedRecordResponse> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
  try {
    return await fetchWithAuth(`/users/u/${username}/watchlist?${params}`)
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.toLowerCase().includes("private")) {
        throw new Error("This user's watchlist is not public")
      }
      if (err.message.toLowerCase().includes("not found")) {
        throw new Error("User not found")
      }
    }
    throw err
  }
}
