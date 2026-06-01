// apps/web/src/lib/users.ts
import type { UserProfile, UserProfileUpdate } from "@kindaseen/shared"

import { fetchWithAuth } from "@/lib/api"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

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
  const res = await fetch(`${API_URL}/users/u/${username}/favorites`)
  if (res.status === 403) throw new Error("This user's favorites are not public")
  if (res.status === 404) throw new Error("User not found")
  if (!res.ok) throw new Error("Failed to fetch favorites")
  return res.json()
}
