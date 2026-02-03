"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, FileText, Video, Headphones, BookOpen, FileCode, MessageSquare, Wrench, File, X, Database, FileSpreadsheet, Check, Undo2, Trash2, Loader2, Headphones as AudioIcon, Download } from "lucide-react"
import { getColorFromString } from "@/lib/utils"
import ReactMarkdown from "react-markdown"

interface ContentItemProps {
  item: {
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
  onStatusChange?: (id: string, newStatus: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

const typeIcons: Record<string, React.ReactNode> = {
  Article: <FileText className="h-4 w-4" />,
  Video: <Video className="h-4 w-4" />,
  Podcast: <Headphones className="h-4 w-4" />,
  Book: <BookOpen className="h-4 w-4" />,
  Paper: <FileCode className="h-4 w-4" />,
  Thread: <MessageSquare className="h-4 w-4" />,
  Tool: <Wrench className="h-4 w-4" />,
  Other: <File className="h-4 w-4" />,
}

const typeColors: Record<string, string> = {
  Article: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Video: "bg-red-500/20 text-red-400 border-red-500/30",
  Podcast: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Book: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Paper: "bg-green-500/20 text-green-400 border-green-500/30",
  Thread: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Tool: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Other: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
}

const statusColors: Record<string, string> = {
  Inbox: "bg-zinc-500/20 text-zinc-400",
  "To Read": "bg-yellow-500/20 text-yellow-400",
  Reading: "bg-blue-500/20 text-blue-400",
  Done: "bg-green-500/20 text-green-400",
  Archived: "bg-zinc-700/20 text-zinc-500",
}

type LinkType = "notion" | "google-doc" | "google-sheet" | "external"

function detectLinkType(url: string | null): LinkType {
  if (!url) return "external"
  if (url.includes("notion.so") || url.includes("notion.site")) return "notion"
  if (url.includes("docs.google.com/document")) return "google-doc"
  if (url.includes("docs.google.com/spreadsheets")) return "google-sheet"
  return "external"
}

function getEmbedUrl(url: string, linkType: LinkType): string {
  if (linkType === "google-doc" || linkType === "google-sheet") {
    if (url.includes("/edit")) {
      return url.replace("/edit", "/preview")
    }
    if (!url.includes("/preview")) {
      return url + (url.includes("?") ? "&" : "?") + "embedded=true"
    }
  }
  return url
}

function getLinkIcon(linkType: LinkType) {
  switch (linkType) {
    case "notion":
      return <Database className="h-3 w-3" />
    case "google-doc":
      return <FileText className="h-3 w-3" />
    case "google-sheet":
      return <FileSpreadsheet className="h-3 w-3" />
    default:
      return <ExternalLink className="h-3 w-3" />
  }
}

function getLinkLabel(linkType: LinkType) {
  switch (linkType) {
    case "notion": return "Notion"
    case "google-doc": return "Google Doc"
    case "google-sheet": return "Google Sheet"
    default: return null
  }
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return "Today"
  if (diffInDays === 1) return "Yesterday"
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  return `${Math.floor(diffInDays / 365)} years ago`
}

export function ContentItem({ item, onStatusChange, onDelete }: ContentItemProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false)
  const [markdownContent, setMarkdownContent] = useState<string | null>(null)
  const [markdownLoading, setMarkdownLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<"status" | "delete" | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const linkType = detectLinkType(item.url)
  const isRead = item.status === "Done"
  const hasMdFile = !!item.mdFileUrl

  const handleStatusToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onStatusChange || actionLoading) return

    setActionLoading("status")
    try {
      const newStatus = isRead ? "To Read" : "Done"
      await onStatusChange(item.id, newStatus)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onDelete || actionLoading) return

    setActionLoading("delete")
    try {
      await onDelete(item.id)
    } finally {
      setActionLoading(null)
      setShowDeleteConfirm(false)
    }
  }

  const handleDeleteCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(false)
  }

  // Only Google Docs/Sheets can be embedded
  const isEmbeddable = linkType === "google-doc" || linkType === "google-sheet"

  const fetchMarkdownContent = async () => {
    if (!item.mdFileUrl) return

    setMarkdownLoading(true)
    try {
      const response = await fetch(`/api/markdown?url=${encodeURIComponent(item.mdFileUrl)}`)
      if (response.ok) {
        const data = await response.json()
        setMarkdownContent(data.content)
      }
    } catch (error) {
      console.error("Failed to fetch markdown:", error)
    } finally {
      setMarkdownLoading(false)
    }
  }

  const handleClick = () => {
    // If there's a markdown file, show the markdown preview
    if (hasMdFile) {
      setShowMarkdownPreview(true)
      if (!markdownContent) {
        fetchMarkdownContent()
      }
      return
    }

    if (!item.url) {
      window.open(item.notionUrl, "_blank", "noopener,noreferrer")
      return
    }

    if (isEmbeddable) {
      setShowPreview(true)
    } else {
      // Notion and external links open directly
      window.open(item.url, "_blank", "noopener,noreferrer")
    }
  }

  const handleOpenExternal = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (item.url) {
      window.open(item.url, "_blank", "noopener,noreferrer")
    }
  }

  const closePreview = () => {
    setShowPreview(false)
  }

  const closeMarkdownPreview = () => {
    setShowMarkdownPreview(false)
  }

  const handleDownloadMd = () => {
    if (!markdownContent) return

    const blob = new Blob([markdownContent], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${item.title.replace(/[^a-zA-Z0-9]/g, "_")}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div
        className="w-full text-left px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all duration-200 group"
      >
        <div className="flex items-center gap-2">
          {/* Main content area - clickable */}
          <button
            onClick={handleClick}
            className="flex-1 min-w-0 text-left focus:outline-none"
          >
            {/* Title first on mobile for better readability */}
            <h3 className="font-medium text-zinc-100 group-hover:text-white text-xs sm:text-sm truncate">
              {item.title}
            </h3>
            {/* Meta info row */}
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              {item.channel && (
                <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/40 text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0">
                  {item.channel}
                </Badge>
              )}
              {item.source && (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0">
                  {item.source}
                </Badge>
              )}
              <span className="text-[9px] sm:text-[10px] text-zinc-600">{getRelativeTime(item.dateAdded)}</span>
            </div>
          </button>

          {/* Action buttons - compact */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {onStatusChange && (
              <button
                onClick={handleStatusToggle}
                className={`p-2 sm:p-1.5 rounded-md border transition-all duration-200 ${
                  isRead
                    ? "bg-green-500/20 border-green-500/40 text-green-400"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-green-500/20 hover:border-green-500/40 hover:text-green-400"
                }`}
                title={isRead ? "Mark as unread" : "Mark as read"}
              >
                {actionLoading === "status" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isRead ? (
                  <Undo2 className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </button>
            )}

            {onDelete && !showDeleteConfirm && (
              <button
                onClick={handleDeleteClick}
                className="p-2 sm:p-1.5 rounded-md border bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 transition-all duration-200"
                title="Delete"
              >
                {actionLoading === "delete" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            )}

            {showDeleteConfirm && (
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={actionLoading === "delete"}
                  className="h-7 px-2 text-xs"
                >
                  {actionLoading === "delete" ? <Loader2 className="h-3 w-3 animate-spin" /> : "OK"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDeleteCancel}
                  disabled={actionLoading === "delete"}
                  className="h-7 px-2 text-xs"
                >
                  X
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && item.url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={closePreview}
        >
          <div
            className="relative w-full max-w-4xl h-[90vh] bg-zinc-900 rounded-lg overflow-hidden border border-zinc-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-zinc-700 bg-zinc-800">
              <div className="flex items-center gap-2">
                {getLinkIcon(linkType)}
                <span className="text-sm text-zinc-300 truncate max-w-md">
                  {item.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenExternal}
                  className="text-zinc-400 hover:text-zinc-200 gap-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closePreview}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content - Google Docs/Sheets iframe */}
            <div className="h-[calc(100%-52px)]">
              <iframe
                src={getEmbedUrl(item.url, linkType)}
                className="w-full h-full bg-white"
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Markdown Preview Modal */}
      {showMarkdownPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4"
          onClick={closeMarkdownPreview}
        >
          <div
            className="relative w-full max-w-3xl h-[95vh] sm:h-[90vh] bg-zinc-900 rounded-lg overflow-hidden border border-zinc-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-zinc-700 bg-zinc-800 flex-shrink-0">
              <span className="text-sm text-zinc-300 truncate flex-1 mr-2">
                {item.title}
              </span>
              <div className="flex items-center gap-2">
                {markdownContent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadMd}
                    className="gap-1.5 border-zinc-600 text-zinc-300 hover:text-white hover:bg-zinc-700"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">.md</span>
                  </Button>
                )}
                {item.url && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleOpenExternal()}
                    className="gap-1.5 bg-violet-600 hover:bg-violet-500 text-white"
                  >
                    <AudioIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Listen</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeMarkdownPreview}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Markdown Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {markdownLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                </div>
              ) : markdownContent ? (
                <article className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-a:text-violet-400 prose-strong:text-zinc-200 prose-ul:text-zinc-300 prose-ol:text-zinc-300 prose-li:text-zinc-300 prose-blockquote:text-zinc-400 prose-blockquote:border-zinc-600">
                  <ReactMarkdown>{markdownContent}</ReactMarkdown>
                </article>
              ) : (
                <p className="text-zinc-500 text-center">Failed to load content</p>
              )}
            </div>

            {/* Footer with buttons on mobile */}
            <div className="sm:hidden p-3 border-t border-zinc-700 bg-zinc-800 flex-shrink-0 flex gap-2">
              {markdownContent && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleDownloadMd}
                  className="gap-2 border-zinc-600 text-zinc-300"
                >
                  <Download className="h-5 w-5" />
                </Button>
              )}
              {item.url && (
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => handleOpenExternal()}
                  className="flex-1 gap-2 bg-violet-600 hover:bg-violet-500 text-white"
                >
                  <AudioIcon className="h-5 w-5" />
                  Listen
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
