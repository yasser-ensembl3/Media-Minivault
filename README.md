# Media Vault

A lightweight, fast read-only frontend for consuming content from a single Notion database. Your daily entry point for "what should I read, watch, or review next?"

## Features

- **Single Source of Truth**: One Notion database for all your content
- **Fast Filtering**: Filter by type, status, source
- **Quick Search**: Search by title or tags
- **Keyboard Shortcuts**: Press `R` to refresh
- **Clean UI**: Optimized for daily use and speed
- **No Auth**: Read-only, no login required

## Quick Start

1. Clone the repository
2. Copy `.env.example` to `.env.local`
3. Add your Notion integration token and database ID
4. Run `npm install && npm run dev`

## Notion Database Setup

Create a Notion database with these properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| Title | Title | Yes | Content name |
| URL | URL | Yes | Link to source |
| Type | Select | Yes | Article, Video, Podcast, Book, Paper, Thread, Tool, Other |
| Status | Select | Yes | Inbox, To Read, Reading, Done, Archived |
| Date Added | Date | Yes | When added (auto-fill) |
| Source | Select | No | YouTube, Twitter, Substack, Medium, etc. |
| Tags | Multi-select | No | Categories |
| Priority | Select | No | High, Medium, Low |
| Notes | Text | No | Personal notes |

### Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Create a new integration
3. Copy the "Internal Integration Token"
4. Share your database with the integration

## Adding Content

Adding content takes < 30 seconds:

1. Open your Notion database
2. Add a new row
3. Fill in Title, URL, Type, Status
4. Done!

**Tip**: Use Notion's Quick Add or browser extensions for faster capture.

## Environment Variables

```env
# Required
NOTION_TOKEN=secret_xxx
NEXT_PUBLIC_NOTION_DATABASE_ID=xxx

# Optional
NEXT_PUBLIC_SITE_NAME=Media Vault
```

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

Deploy to Vercel:

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

## Out of Scope (v1)

Intentionally excluded:
- User authentication
- Write-back to Notion
- Analytics/Dashboards
- AI features
- Multiple databases
- External integrations

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- shadcn/ui components
- Notion API
- Vercel hosting
