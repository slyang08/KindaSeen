// apps/web/src/app/page.tsx
"use client"

import type { Record } from "@kindaseen/shared"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { useAuth } from "@/components/auth/AuthProvider"
import { recordsApi } from "@/lib/records"

export default function HomePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [records, setRecords] = useState<Record[]>([])

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    recordsApi.getAll().then(setRecords).catch(console.error)
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <>
      <div style={{ padding: 20 }}>
        <h1>Home</h1>
        <p>User: {user.email}</p>

        <button
          onClick={() => {
            logout()
            router.push("/login")
          }}
        >
          Logout
        </button>

        <h2>Records</h2>
        <ul>
          {records.map((record) => (
            <li key={record.id}>
              {record.title} — {record.media_type} — {record.status}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
