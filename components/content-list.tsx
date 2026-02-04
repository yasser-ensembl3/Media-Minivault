"use client"

import { useEffect, useState, useCallback } from "react"
import { ContentItem } from "./content-item"
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
}

export function ContentList({ mode = "unread" }: ContentListProps) {
  const [items, setItems] = useState<ContentItemData[]>([])
  const [filteredItems, setFilteredItems] = useState<ContentItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  // Filter items by mode
  useEffect(() => {
    let result = items

    if (mode === "unread") {
      result = result.filter((item) => item.status !== "Done")
    } else if (mode === "read") {
      result = result.filter((item) => item.status === "Done")
    }

    setFilteredItems(result)
  }, [items, mode])

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-xs sm:text-sm text-zinc-500">
          {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchContent}
          className="text-zinc-500 hover:text-zinc-300 h-10 w-10"
          title="Refresh (R)"
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>

      {/* Content list */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Inbox className="h-12 w-12 text-zinc-600 mb-4" />
          <p className="text-zinc-400 mb-2">No content found</p>
          <p className="text-zinc-500 text-sm">
            Add some content to your Notion database
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
