// src/features/statistics/StatisticsPage.tsx
"use client"

import type { Record as MediaRecord } from "@kindaseen/shared"
import { MEDIA_TYPE_LABELS, STATUS_LABELS } from "@kindaseen/shared"
import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { recordsApi } from "@/lib/records"

const STATUS_COLORS: Record<string, string> = {
  watching: "#3b82f6",
  completed: "#22c55e",
  dropped: "#ef4444",
  want_to_watch: "#94a3b8",
}

function computeStats(records: MediaRecord[]) {
  const total = records.length
  const byStatus = Object.fromEntries(
    Object.keys(STATUS_LABELS).map((s) => [s, records.filter((r) => r.status === s).length])
  )
  const completed = byStatus.completed ?? 0
  const tracked = total - (byStatus.want_to_watch ?? 0)
  const completionRate = tracked > 0 ? Math.round((completed / tracked) * 100) : 0

  const rated = records.filter((r) => r.rating != null)
  const avgRating =
    rated.length > 0
      ? (rated.reduce((sum, r) => sum + (r.rating ?? 0), 0) / rated.length).toFixed(1)
      : null

  const genreCount: Record<string, number> = {}
  records.forEach((r) =>
    r.genres?.forEach((g) => {
      genreCount[g] = (genreCount[g] ?? 0) + 1
    })
  )
  const topGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  const ratingBuckets = [
    { label: "1-3", count: rated.filter((r) => (r.rating ?? 0) <= 3).length },
    {
      label: "4-6",
      count: rated.filter((r) => (r.rating ?? 0) >= 4 && (r.rating ?? 0) <= 6).length,
    },
    {
      label: "7-9",
      count: rated.filter((r) => (r.rating ?? 0) >= 7 && (r.rating ?? 0) <= 9).length,
    },
    { label: "10", count: rated.filter((r) => r.rating === 10).length },
  ]

  const now = new Date()
  const thisYear = records.filter(
    (r) => new Date(r.created_at).getFullYear() === now.getFullYear()
  ).length
  const last30 = records.filter(
    (r) => (now.getTime() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24) <= 30
  ).length

  const byMediaType = Object.entries(
    records.reduce(
      (acc, r) => {
        acc[r.media_type] = (acc[r.media_type] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
  )
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({
      name: MEDIA_TYPE_LABELS[type as keyof typeof MEDIA_TYPE_LABELS] ?? type,
      count,
    }))

  return {
    total,
    byStatus,
    completionRate,
    avgRating,
    topGenres,
    ratingBuckets,
    thisYear,
    last30,
    byMediaType,
  }
}

export function StatisticsPage() {
  const [records, setRecords] = useState<MediaRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    recordsApi.getAll().then((data) => {
      setRecords(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>
  if (records.length === 0)
    return <div className="text-center py-12 text-muted-foreground">No records yet.</div>

  const stats = computeStats(records)

  const statusChartData = Object.entries(stats.byStatus)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: STATUS_LABELS[status as keyof typeof STATUS_LABELS],
      value: count,
      color: STATUS_COLORS[status],
    }))

  return (
    <div className="py-6 space-y-8">
      <h1 className="text-2xl font-semibold">Statistics</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total },
          { label: "Completed", value: stats.byStatus.completed ?? 0 },
          { label: "This Year", value: stats.thisYear },
          { label: "Last 30 Days", value: stats.last30 },
        ].map(({ label, value }) => (
          <div key={label} className="border rounded-lg p-4 space-y-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      {/* Rating + completion */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border rounded-lg p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Avg Rating</p>
          <p className="text-2xl font-semibold">{stats.avgRating ?? "—"}</p>
        </div>
        <div className="border rounded-lg p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Completion Rate</p>
          <p className="text-2xl font-semibold">{stats.completionRate}%</p>
        </div>
      </div>

      {/* Status donut */}
      <div className="border rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium">Status Distribution</p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                paddingAngle={2}
              >
                {statusChartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2">
            {statusChartData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <span
                  className="inline-block w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{entry.name}</span>
                <span className="font-medium ml-auto pl-4">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Genres */}
      {stats.topGenres.length > 0 && (
        <div className="border rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium">Top Genres</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.topGenres} layout="vertical" margin={{ left: 8, right: 16 }}>
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Rating distribution */}
      {stats.ratingBuckets.some((b) => b.count > 0) && (
        <div className="border rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium">Rating Distribution</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stats.ratingBuckets} margin={{ left: 8, right: 16 }}>
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Media type breakdown */}
      {stats.byMediaType.length > 0 && (
        <div className="border rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium">By Media Type</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stats.byMediaType} margin={{ left: 8, right: 16 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
