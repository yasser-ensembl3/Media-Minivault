"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, FileText, Video, Headphones, BookOpen, FileCode, MessageSquare, Wrench, File, X, Database, FileSpreadsheet } from "lucide-react"

interface ContentItemProps {
  item: {
    id: string
    title: string
    url: string | null
    type: string | null
    source: string | null
    status: string
    dateAdded: string
    notionUrl: string
  }
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
    // Add embedded view parameter for Google Docs/Sheets
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

export function ContentItem({ item }: ContentItemProps) {
  const [showPreview, setShowPreview] = useState(false)
  const linkType = detectLinkType(item.url)
  // Only Google Docs/Sheets can be embedded (Notion blocks iframes)
  const isEmbeddable = linkType === "google-doc" || linkType === "google-sheet"

  const handleClick = () => {
    if (isEmbeddable && item.url) {
      setShowPreview(true)
    } else if (item.url) {
      window.open(item.url, "_blank", "noopener,noreferrer")
    } else {
      window.open(item.notionUrl, "_blank", "noopener,noreferrer")
    }
  }

  const handleOpenExternal = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (item.url) {
      window.open(item.url, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full text-left p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-zinc-600"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {item.type && (
                <Badge
                  variant="outline"
                  className={`${typeColors[item.type] || typeColors.Other} flex items-center gap-1 text-xs`}
                >
                  {typeIcons[item.type] || typeIcons.Other}
                  {item.type}
                </Badge>
              )}
              {getLinkLabel(linkType) && (
                <Badge
                  variant="outline"
                  className="bg-zinc-700/30 text-zinc-400 border-zinc-600 flex items-center gap-1 text-xs"
                >
                  {getLinkIcon(linkType)}
                  {getLinkLabel(linkType)}
                </Badge>
              )}
            </div>

            <h3 className="font-medium text-zinc-100 group-hover:text-white truncate mb-2">
              {item.title}
            </h3>

            <div className="flex items-center gap-2 text-sm text-zinc-500 flex-wrap">
              {item.source && (
                <span className="text-zinc-400">{item.source}</span>
              )}
              {item.source && <span>•</span>}
              <Badge variant="secondary" className={`${statusColors[item.status] || statusColors.Inbox} text-xs`}>
                {item.status}
              </Badge>
              <span>•</span>
              <span>{getRelativeTime(item.dateAdded)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0 mt-1">
            {isEmbeddable && (
              <span
                onClick={handleOpenExternal}
                className="p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </span>
            )}
            {!isEmbeddable && (
              <ExternalLink className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300" />
            )}
          </div>
        </div>
      </button>

      {/* Preview Modal */}
      {showPreview && item.url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-6xl h-[90vh] bg-zinc-900 rounded-lg overflow-hidden border border-zinc-700">
            <div className="flex items-center justify-between p-3 border-b border-zinc-700 bg-zinc-800">
              <div className="flex items-center gap-2">
                {getLinkIcon(linkType)}
                <span className="text-sm text-zinc-300 truncate max-w-md">{item.title}</span>
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
                  onClick={() => setShowPreview(false)}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <iframe
              src={getEmbedUrl(item.url, linkType)}
              className="w-full h-[calc(100%-52px)] bg-white"
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  )
}
