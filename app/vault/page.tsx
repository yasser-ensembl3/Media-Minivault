import { ContentList } from "@/components/content-list"
import { BookOpen } from "lucide-react"
import Link from "next/link"

export default function VaultPage() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "ContentVault"

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-zinc-400" />
              <h1 className="text-2xl font-bold text-zinc-100">{siteName}</h1>
            </div>
            <Link
              href="/docs"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition"
            >
              Docs
            </Link>
          </div>
          <p className="text-zinc-500">
            Your daily entry point for content consumption
          </p>
        </header>

        {/* Content */}
        <ContentList />

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-zinc-800 text-center text-sm text-zinc-600">
          <p>
            Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">R</kbd> to refresh
          </p>
        </footer>
      </div>
    </main>
  )
}
