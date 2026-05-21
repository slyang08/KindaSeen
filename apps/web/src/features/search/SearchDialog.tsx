// apps/web/src/features/search/SearchDialog.tsx
"use client"

import type { TMDBSearchResult } from "@kindaseen/shared"
import { Search } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { SearchCombobox } from "./SearchCombobox"

type Props = {
  onSelect: (result: TMDBSearchResult) => void
}

export function SearchDialog({ onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const [savedQuery, setSavedQuery] = useState("")

  const handleSelect = (result: TMDBSearchResult) => {
    onSelect(result)
    setOpen(false)
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Search className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-2xl top-[12vh] translate-y-0 p-4 overflow-visible"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <SearchCombobox
            onSelect={handleSelect}
            defaultQuery={savedQuery}
            onQueryChange={setSavedQuery}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
