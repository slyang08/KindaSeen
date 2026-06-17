// apps/web/src/hooks/useInfiniteScrollSentinel.ts
import { useEffect, useRef } from "react"

export function useInfiniteScrollSentinel({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
    // Intentionally exclude isFetchingNextPage / fetchNextPage from dependencies
    // To avoid re-observing every time the fetch state changes, causing repeated fetching while the sentinel is still visible
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNextPage])

  return sentinelRef
}
