// apps/web/src/app/favorites/page.tsx
"use client"

import { ShareExpiry } from "@kindaseen/shared"
import { useMemo, useState } from "react"

import { useCreatePersonalShare, useFavorites } from "@/features/favorites"
import { RecordCard, useRecords } from "@/features/records"
import { useMyProfile } from "@/features/settings/queries"

export default function FavoritesPage() {
  const { data: recordsData } = useRecords({})
  const { data: favorites } = useFavorites()
  const { data: profile } = useMyProfile()
  const { mutate: createShare, isPending } = useCreatePersonalShare()

  const [selectedExpiry, setSelectedExpiry] = useState<ShareExpiry>("1h")
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const favoriteIds = useMemo(() => new Set(favorites?.map((f) => f.record_id) ?? []), [favorites])

  const favoriteRecords = useMemo(() => {
    const records = recordsData?.pages.flatMap((page) => page.items) ?? []
    return records?.filter((r) => favoriteIds.has(r.id))
  }, [recordsData, favoriteIds])

  const handleGenerateLink = () => {
    setGeneratedLink(null)
    createShare(selectedExpiry, {
      onSuccess: (data) => {
        setGeneratedLink(data.link)
        setExpiresAt(data.expires_at)
      },
    })
  }

  const handleCopy = () => {
    if (!generatedLink) return
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatExpiry = (iso: string) => {
    return new Date(iso).toLocaleString()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Favorites</h1>

      {/* Sharing */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Share your favorites</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {profile?.is_public_sharing_enabled
                ? `Public link: ${window.location.origin}/u/${profile.username}/favorites`
                : "Public sharing is off. You can generate a private link below."}
            </p>
          </div>
          {profile?.is_public_sharing_enabled && (
            <button
              className="text-xs text-blue-500 hover:underline"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/u/${profile.username}/favorites`
                )
              }}
            >
              Copy public link
            </button>
          )}
        </div>

        {/* Personal share */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Generate a private link with expiry</p>
          <div className="flex items-center gap-2">
            <select
              className="rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedExpiry}
              onChange={(e) => {
                setSelectedExpiry(e.target.value as ShareExpiry)
                setGeneratedLink(null)
              }}
            >
              <option value="1h">1 hour</option>
              <option value="1d">1 day</option>
            </select>
            <button
              className="rounded-md bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
              onClick={handleGenerateLink}
              disabled={isPending}
            >
              {isPending ? "Generating..." : "Generate link"}
            </button>
          </div>

          {generatedLink && expiresAt && (
            <div className="rounded-md bg-muted px-3 py-2 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-mono truncate">{generatedLink}</p>
                <button
                  className="text-xs text-blue-500 hover:underline shrink-0"
                  onClick={handleCopy}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Expires at {formatExpiry(expiresAt)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Favorites list */}
      {favoriteRecords.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No favorites yet.</p>
      ) : (
        <div className="space-y-3">
          {favoriteRecords.map((record, index) => (
            <RecordCard key={record.id} record={record} priority={index === 0} isFavorite={true} />
          ))}
        </div>
      )}
    </div>
  )
}
