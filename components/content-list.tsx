"use client"

import { useEffect, useState, useCallback } from "react"
import { ContentItem } from "./content-item"
import { FilterBar } from "./filter-bar"
import { SearchInput } from "./search-input"
import { AddContentForm } from "./add-content-form"
import { Loader2, Inbox, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ContentItemData {
  id: string
  title: string
  url: string | null
  type: string | null
  source: string | null
  channel: string | null
  status: string
  dateAdded: string
  notionUrl: string
  mdFileUrl: string | null
}

interface ApiResponse {
  items: ContentItemData[]
  filters: {
    types: string[]
    sources: string[]
    channels: string[]
    statuses: string[]
  }
}

interface ContentListProps {
  mode?: "unread" | "read" | "all"
  showAddForm?: boolean
}

export function ContentList({ mode = "unread", showAddForm = true }: ContentListProps) {
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

    // Apply mode filter first
    if (mode === "unread") {
      result = result.filter((item) => item.status !== "Done")
    } else if (mode === "read") {
      result = result.filter((item) => item.status === "Done")
    }

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
  }, [items, mode, selectedType, selectedSource, selectedStatus, searchQuery])

  // Handle status change
  const handleStatusChange = useCallback(async (id: string, newStatus: string) => {
    const response = await fetch("/api/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    })

    if (!response.ok) {
      throw new Error("Failed to update status")
    }

    // Update local state
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    )
  }, [])

  // Handle delete
  const handleDelete = useCallback(async (id: string) => {
    const response = await fetch(`/api/content?id=${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete content")
    }

    // Remove from local state
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

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
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile optimized */}
      <div className="space-y-3">
        {/* Search + Refresh row */}
        <div className="flex gap-2 items-center">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchContent}
            className="text-zinc-500 hover:text-zinc-300 h-10 w-10 flex-shrink-0"
            title="Refresh (R)"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>

        {/* Filters - horizontal scroll on mobile */}
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
      </div>

      {/* Add Content */}
      {showAddForm && <AddContentForm onSuccess={fetchContent} />}

      {/* Stats */}
      <div className="text-xs sm:text-sm text-zinc-500">
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
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <ContentItem
              key={item.id}
              item={item}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
