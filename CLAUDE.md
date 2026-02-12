# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Media Vault is a read-only frontend that displays content from a single Notion database. It serves as a daily entry point for content consumption (articles, videos, podcasts, etc.).

### Key Principles

1. **Simplicity**: Read-only, no auth, one database
2. **Speed**: Fast loading, quick filtering, optimized for daily use
3. **Single Purpose**: Answer "what should I read/watch next?"

## Architecture

```
MediaVault/
├── app/
│   ├── api/content/route.ts   # Single API endpoint for Notion
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Main page with ContentList
├── components/
│   ├── content-list.tsx       # Main list with state management
│   ├── content-item.tsx       # Individual content card
│   ├── filter-bar.tsx         # Type/Status/Source filters
│   ├── search-input.tsx       # Search input
│   └── ui/                    # shadcn/ui components
├── lib/
│   └── utils.ts               # cn() utility
└── .env.local                 # Configuration
```

## Development Commands

```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # Run ESLint
```

## API Endpoint

### GET /api/content

Fetches all content from Notion database.

**Query Parameters:**
- `type` - Filter by content type
- `status` - Filter by status
- `source` - Filter by source
- `search` - Search in title

**Response:**
```json
{
  "items": [...],
  "filters": {
    "types": ["Article", "Video", ...],
    "sources": ["YouTube", "Twitter", ...],
    "statuses": ["Inbox", "To Read", ...]
  }
}
```

## Environment Variables

```env
NOTION_TOKEN=secret_xxx
NEXT_PUBLIC_NOTION_DATABASE_ID=xxx
NEXT_PUBLIC_SITE_NAME=Media Vault
```

## Notion Database Schema

| Property | Type | Required |
|----------|------|----------|
| Title | Title | Yes |
| URL | URL | Yes |
| Type | Select | Yes |
| Status | Select | Yes |
| Date Added | Date | Yes |
| Source | Select | No |
| Tags | Multi-select | No |
| Priority | Select | No |
| Notes | Text | No |

## UI Components

- **ContentList**: Main container, manages state, keyboard shortcuts
- **ContentItem**: Clickable card that opens URL in new tab
- **FilterBar**: Select dropdowns for type/status/source
- **SearchInput**: Text input with clear button

## Keyboard Shortcuts

- `R` - Refresh content list

## Out of Scope

- Authentication
- Write operations
- Analytics
- AI features
- Multiple databases
