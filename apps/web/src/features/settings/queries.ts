// apps/web/src/features/settings/queries.ts
import type { UserProfileUpdate } from "@kindaseen/shared"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getMyProfile, updateMyProfile } from "@/lib/users"

export function useMyProfile() {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: getMyProfile,
  })
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UserProfileUpdate) => updateMyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] })
    },
  })
}
