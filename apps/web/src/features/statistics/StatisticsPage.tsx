// src/features/statistics/StatisticsPage.tsx
"use client"

import type { UserStatsResponse } from "@kindaseen/shared"
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

import { statsApi } from "@/lib/stats"

const STATUS_COLORS: Record<string, string> = {
  watching: "#3b82f6",
  completed: "#22c55e",
  dropped: "#ef4444",
  want_to_watch: "#94a3b8",
}

export function StatisticsPage() {
  const [stats, setStats] = useState<UserStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    statsApi.getMyStats().then((data) => {
      setStats(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>
  if (!stats) return <div className="text-center py-12 text-muted-foreground">No records yet.</div>

  const completionRate = (() => {
    const tracked = stats.total - (stats.by_status.want_to_watch ?? 0)
    return tracked > 0 ? Math.round(((stats.by_status.completed ?? 0) / tracked) * 100) : 0
  })()

  const statusChartData = Object.entries(stats.by_status)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: STATUS_LABELS[status as keyof typeof STATUS_LABELS],
      value: count,
      color: STATUS_COLORS[status],
    }))

  const mediaTypeCharData = stats.by_media_type.map(({ media_type, count }) => ({
    name: MEDIA_TYPE_LABELS[media_type as keyof typeof MEDIA_TYPE_LABELS] ?? media_type,
    count,
  }))

  return (
    <div className="py-6 space-y-8">
      <h1 className="text-2xl font-semibold">Statistics</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total },
          { label: "Completed", value: stats.by_status.completed ?? 0 },
          { label: "This Year", value: stats.this_year },
          { label: "Last 30 Days", value: stats.last_30_days },
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
          <p className="text-2xl font-semibold">
            {stats.avg_rating != null ? stats.avg_rating.toFixed(1) : "—"}
          </p>
        </div>
        <div className="border rounded-lg p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Completion Rate</p>
          <p className="text-2xl font-semibold">{completionRate}%</p>
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
      {stats.top_genres.length > 0 && (
        <div className="border rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium">Top Genres</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.top_genres} layout="vertical" margin={{ left: 8, right: 16 }}>
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Rating distribution */}
      {stats.rating_distribution.some((b) => b.count > 0) && (
        <div className="border rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium">Rating Distribution</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stats.rating_distribution} margin={{ left: 8, right: 16 }}>
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Media type breakdown */}
      {mediaTypeCharData.length > 0 && (
        <div className="border rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium">By Media Type</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={mediaTypeCharData} margin={{ left: 8, right: 16 }}>
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
