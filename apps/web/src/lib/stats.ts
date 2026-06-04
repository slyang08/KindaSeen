// apps/web/src/lib/stats.ts
import type { UserStatsResponse } from "@kindaseen/shared"

import { fetchWithAuth } from "@/lib/api"

export const statsApi = {
  getMyStats: (): Promise<UserStatsResponse> => fetchWithAuth("/users/me/stats"),
}
