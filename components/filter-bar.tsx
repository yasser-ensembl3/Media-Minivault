"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FilterBarProps {
  types: string[]
  sources: string[]
  statuses: string[]
  selectedType: string
  selectedSource: string
  selectedStatus: string
  onTypeChange: (value: string) => void
  onSourceChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export function FilterBar({
  types,
  sources,
  statuses,
  selectedType,
  selectedSource,
  selectedStatus,
  onTypeChange,
  onSourceChange,
  onStatusChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select value={selectedType} onValueChange={onTypeChange}>
        <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-700">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-700">
          <SelectItem value="all">All Types</SelectItem>
          {types.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-700">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-700">
          <SelectItem value="all">All Status</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedSource} onValueChange={onSourceChange}>
        <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-700">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-700">
          <SelectItem value="all">All Sources</SelectItem>
          {sources.map((source) => (
            <SelectItem key={source} value={source}>
              {source}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
