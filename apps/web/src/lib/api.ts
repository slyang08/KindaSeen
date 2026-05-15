// apps/web/src/lib/api.ts
import { supabase } from "@/lib/supabase"

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const { data } = await supabase.auth.getSession()

  const token = data.session?.access_token

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  })
}
