import { ContentList } from "@/components/content-list"
import { CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ArchivePage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">Archive</h1>
            </div>
            <Link
              href="/vault"
              className="flex items-center justify-center gap-1 text-xs sm:text-sm text-zinc-400 hover:text-zinc-200 transition p-2 sm:px-3 sm:py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 bg-zinc-800/50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </div>
          <p className="text-sm sm:text-base text-zinc-500">
            Content you&apos;ve already read
          </p>
        </header>

        {/* Content - Read items only */}
        <ContentList />

        {/* Footer - hidden on mobile */}
        <footer className="hidden sm:block mt-12 pt-6 border-t border-zinc-800 text-center text-sm text-zinc-600">
          <p>
            Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">R</kbd> to refresh
          </p>
        </footer>
      </div>
    </main>
  )
}
