"use client"

import { Badge } from "@/components/ui/badge"
import { ExternalLink, FileText, Video, Headphones, BookOpen, FileCode, MessageSquare, Wrench, File } from "lucide-react"

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
  const handleClick = () => {
    if (item.url) {
      window.open(item.url, "_blank", "noopener,noreferrer")
    } else {
      window.open(item.notionUrl, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <button
      onClick={handleClick}
      className="w-full text-left p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-zinc-600"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {item.type && (
              <Badge
                variant="outline"
                className={`${typeColors[item.type] || typeColors.Other} flex items-center gap-1 text-xs`}
              >
                {typeIcons[item.type] || typeIcons.Other}
                {item.type}
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

        <ExternalLink className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300 flex-shrink-0 mt-1" />
      </div>
    </button>
  )
}
