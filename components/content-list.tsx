"use client"

import { useEffect, useState, useCallback } from "react"
import { ContentItem } from "./content-item"
import { FilterBar } from "./filter-bar"
import { SearchInput } from "./search-input"
import { Loader2, Inbox, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ContentItemData {
  id: string
  title: string
  url: string | null
  type: string | null
  source: string | null
  status: string
  dateAdded: string
  notionUrl: string
}

interface ApiResponse {
  items: ContentItemData[]
  filters: {
    types: string[]
    sources: string[]
    statuses: string[]
  }
}

export function ContentList() {
  const [items, setItems] = useState<ContentItemData[]>([])
  const [filteredItems, setFilteredItems] = useState<ContentItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter options from API
  const [types, setTypes] = useState<string[]>([])
  const [sources, setSources] = useState<string[]>([])
  const [statuses, setStatuses] = useState<string[]>([])

  // Selected filters
  const [selectedType, setSelectedType] = useState("all")
  const [selectedSource, setSelectedSource] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const fetchContent = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/content")
      if (!response.ok) {
        throw new Error("Failed to fetch content")
      }

      const data: ApiResponse = await response.json()
      setItems(data.items)
      setFilteredItems(data.items)
      setTypes(data.filters.types)
      setSources(data.filters.sources)
      setStatuses(data.filters.statuses)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  // Filter items locally
  useEffect(() => {
    let result = items

    if (selectedType !== "all") {
      result = result.filter((item) => item.type === selectedType)
    }

    if (selectedSource !== "all") {
      result = result.filter((item) => item.source === selectedSource)
    }

    if (selectedStatus !== "all") {
      result = result.filter((item) => item.status === selectedStatus)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((item) => item.title.toLowerCase().includes(query))
    }

    setFilteredItems(result)
  }, [items, selectedType, selectedSource, selectedStatus, searchQuery])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if typing in input
      if (e.target instanceof HTMLInputElement) return

      if (e.key === "r" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        fetchContent()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [fetchContent])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={fetchContent} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <div className="flex items-center gap-3">
          <FilterBar
            types={types}
            sources={sources}
            statuses={statuses}
            selectedType={selectedType}
            selectedSource={selectedSource}
            selectedStatus={selectedStatus}
            onTypeChange={setSelectedType}
            onSourceChange={setSelectedSource}
            onStatusChange={setSelectedStatus}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchContent}
            className="text-zinc-500 hover:text-zinc-300"
            title="Refresh (R)"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="text-sm text-zinc-500">
        {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
        {(selectedType !== "all" || selectedSource !== "all" || selectedStatus !== "all" || searchQuery) && (
          <span> (filtered from {items.length})</span>
        )}
      </div>

      {/* Content list */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Inbox className="h-12 w-12 text-zinc-600 mb-4" />
          <p className="text-zinc-400 mb-2">No content found</p>
          <p className="text-zinc-500 text-sm">
            {searchQuery || selectedType !== "all" || selectedSource !== "all" || selectedStatus !== "all"
              ? "Try adjusting your filters"
              : "Add some content to your Notion database"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <ContentItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
