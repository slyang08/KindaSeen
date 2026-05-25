// src/app/statistics/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { useAuth } from "@/features/auth/AuthProvider"
import { StatisticsPage } from "@/features/statistics"

export default function Page() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  if (loading || !user) return null

  return <StatisticsPage />
}
