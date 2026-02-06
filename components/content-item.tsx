"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Video, Headphones, MessageSquare, X, Loader2, Headphones as AudioIcon, Download } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface ContentItemProps {
  item: {
    id: string
    title: string
    type: string | null
    dateAdded: string
    notionUrl: string
    mdFileUrl: string | null
    audioUrl: string | null
  }
}

const typeIcons: Record<string, React.ReactNode> = {
  Podcast: <Headphones className="h-4 w-4" />,
  "Youtube video": <Video className="h-4 w-4" />,
  Audio: <Headphones className="h-4 w-4" />,
  "Talk Show": <MessageSquare className="h-4 w-4" />,
  Post: <FileText className="h-4 w-4" />,
  "Article/News": <FileText className="h-4 w-4" />,
}

const typeColors: Record<string, string> = {
  Podcast: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Youtube video": "bg-red-500/20 text-red-400 border-red-500/30",
  Audio: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "Talk Show": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Post: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Article/News": "bg-green-500/20 text-green-400 border-green-500/30",
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
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false)
  const [markdownContent, setMarkdownContent] = useState<string | null>(null)
  const [markdownLoading, setMarkdownLoading] = useState(false)

  const hasMdFile = !!item.mdFileUrl
  const hasAudio = !!item.audioUrl

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
    if (hasMdFile) {
      setShowMarkdownPreview(true)
      if (!markdownContent) {
        fetchMarkdownContent()
      }
      return
    }

    if (hasAudio) {
      window.open(item.audioUrl!, "_blank", "noopener,noreferrer")
      return
    }

    window.open(item.notionUrl, "_blank", "noopener,noreferrer")
  }

  const handleOpenAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (item.audioUrl) {
      window.open(item.audioUrl, "_blank", "noopener,noreferrer")
    }
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
              {item.type && (
                <Badge className={`${typeColors[item.type] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"} text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0`}>
                  {typeIcons[item.type]} {item.type}
                </Badge>
              )}
              <span className="text-[9px] sm:text-[10px] text-zinc-600">{getRelativeTime(item.dateAdded)}</span>
            </div>
          </button>

          {/* Audio indicator */}
          {hasAudio && (
            <div className="flex-shrink-0">
              <Headphones className="h-4 w-4 text-violet-400" />
            </div>
          )}
        </div>
      </div>

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
                {item.audioUrl && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleOpenAudio()}
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
              {item.audioUrl && (
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => handleOpenAudio()}
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
