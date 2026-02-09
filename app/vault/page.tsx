import { ContentList } from "@/components/content-list"
import { BookOpen, CheckCircle, Heart } from "lucide-react"
import Link from "next/link"

export default function VaultPage() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "ContentVault"

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-zinc-400" />
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">{siteName}</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/vault/favorites"
                className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-zinc-400 hover:text-pink-400 transition p-2 sm:px-3 sm:py-1.5 rounded-lg border border-zinc-700 hover:border-pink-500/50 bg-zinc-800/50"
              >
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Favorites</span>
              </Link>
              <Link
                href="/vault/archive"
                className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-zinc-400 hover:text-green-400 transition p-2 sm:px-3 sm:py-1.5 rounded-lg border border-zinc-700 hover:border-green-500/50 bg-zinc-800/50"
              >
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Archive</span>
              </Link>
              <Link
                href="/docs"
                className="flex items-center justify-center text-xs sm:text-sm text-zinc-400 hover:text-zinc-200 transition p-2 sm:px-3 sm:py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 bg-zinc-800/50"
              >
                <span className="hidden sm:inline">Docs</span>
                <span className="sm:hidden">?</span>
              </Link>
            </div>
          </div>
          <p className="text-sm sm:text-base text-zinc-500">
            Your daily entry point for content consumption
          </p>
        </header>

        {/* Content - Unread items only */}
        <ContentList mode="unread" />

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
