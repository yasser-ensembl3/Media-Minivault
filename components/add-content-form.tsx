"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, X, Loader2 } from "lucide-react"

interface AddContentFormProps {
  onSuccess: () => void
}

const TYPES = ["Article", "Video", "Podcast", "Book", "Paper", "Thread", "Tool", "Other"]
const SOURCES = ["YouTube", "Twitter", "Substack", "ArXiv", "Blog", "GitHub", "Newsletter", "Other"]

export function AddContentForm({ onSuccess }: AddContentFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [type, setType] = useState("")
  const [source, setSource] = useState("")

  const resetForm = () => {
    setTitle("")
    setUrl("")
    setType("")
    setSource("")
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          url,
          type: type || undefined,
          source: source || undefined,
          status: "Inbox",
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to add content")
      }

      resetForm()
      setIsOpen(false)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="gap-2 border-zinc-700 hover:bg-zinc-800"
      >
        <Plus className="h-4 w-4" />
        Add
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-lg border border-zinc-700 bg-zinc-900/80 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-zinc-200">Add Content</h3>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => { setIsOpen(false); resetForm() }}
          className="h-8 w-8 text-zinc-500"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <div className="grid gap-3">
        <Input
          placeholder="Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="bg-zinc-800 border-zinc-700"
        />
        <Input
          placeholder="URL *"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="bg-zinc-800 border-zinc-700"
        />
        <div className="grid grid-cols-2 gap-3">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              {TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              {SOURCES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => { setIsOpen(false); resetForm() }}
          className="text-zinc-400"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !title || !url}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
        </Button>
      </div>
    </form>
  )
}
