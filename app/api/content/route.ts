import { NextResponse } from "next/server"

const NOTION_TOKEN = process.env.NOTION_TOKEN
const DATABASE_ID = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID

// PATCH - Update content status
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID and status are required" },
        { status: 400 }
      )
    }

    const response = await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          Status: { select: { name: status } },
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update status")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating status:", error)
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    )
  }
}

// DELETE - Archive content (Notion API only supports archiving)
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json(
      { error: "ID is required" },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        archived: true,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete content")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting content:", error)
    return NextResponse.json(
      { error: "Failed to delete content" },
      { status: 500 }
    )
  }
}

// POST - Add new content
export async function POST(request: Request) {
  if (!DATABASE_ID) {
    return NextResponse.json(
      { error: "Database ID not configured" },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const { title, url, type, status, source } = body

    if (!title || !url) {
      return NextResponse.json(
        { error: "Title and URL are required" },
        { status: 400 }
      )
    }

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: { database_id: DATABASE_ID },
        properties: {
          Name: { title: [{ text: { content: title } }] },
          URL: { url },
          Type: type ? { select: { name: type } } : undefined,
          Status: { select: { name: status || "Inbox" } },
          Source: source ? { select: { name: source } } : undefined,
          "Date Added": { date: { start: new Date().toISOString().split("T")[0] } },
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create content")
    }

    const page = await response.json()
    return NextResponse.json({ success: true, id: page.id })
  } catch (error) {
    console.error("Error creating content:", error)
    return NextResponse.json(
      { error: "Failed to create content" },
      { status: 500 }
    )
  }
}

async function queryNotionDatabase(filters: object[] = []) {
  const response = await fetch(
    `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: filters.length > 0 ? { and: filters } : undefined,
        sorts: [{ property: "Date", direction: "descending" }],
        page_size: 100,
      }),
      cache: "no-store", // No cache for instant updates
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to query Notion")
  }

  return response.json()
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")
  const search = searchParams.get("search")

  if (!DATABASE_ID) {
    return NextResponse.json(
      { error: "Database ID not configured" },
      { status: 500 }
    )
  }

  try {
    // Build filters
    const filters: object[] = []

    if (type && type !== "all") {
      filters.push({ property: "type", select: { equals: type } })
    }

    if (search) {
      filters.push({ property: "Link", title: { contains: search } })
    }

    const response = await queryNotionDatabase(filters)

    interface NotionFile {
      name: string
      type: "file" | "external"
      file?: { url: string; expiry_time: string }
      external?: { url: string }
    }

    interface NotionPage {
      id: string
      url: string
      created_time: string
      properties: {
        Link?: { title?: Array<{ plain_text?: string }> }
        type?: { select?: { name?: string } }
        "Text summary"?: { files?: NotionFile[] }
        "Audio summary"?: { files?: NotionFile[] }
        Date?: { date?: { start?: string } }
      }
    }

    const items = (response.results as NotionPage[]).map((page) => {
      const properties = page.properties

      // Extract .md file URL from Text summary
      const textFiles = properties["Text summary"]?.files || []
      const mdFile = textFiles.find((f) => f.name?.endsWith(".md"))
      const mdFileUrl = mdFile?.type === "file"
        ? mdFile.file?.url
        : mdFile?.external?.url

      // Extract audio URL from Audio summary (ElevenReader link or mp3)
      const audioFiles = properties["Audio summary"]?.files || []
      const audioFile = audioFiles[0]
      let audioUrl = audioFile?.type === "file"
        ? audioFile.file?.url
        : audioFile?.external?.url

      // Convert Google Drive view URLs to direct download for mp3
      if (audioUrl) {
        const driveMatch = audioUrl.match(/drive\.google\.com\/file\/d\/([^/]+)/)
        if (driveMatch) {
          audioUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`
        }
      }

      return {
        id: page.id,
        title: properties.Link?.title?.[0]?.plain_text || "Untitled",
        type: properties.type?.select?.name || null,
        dateAdded: properties.Date?.date?.start || page.created_time,
        notionUrl: page.url,
        mdFileUrl: mdFileUrl || null,
        audioUrl: audioUrl || null,
      }
    })

    // Get unique values for filters
    const allTypes = [...new Set(items.map((item) => item.type).filter(Boolean))]

    return NextResponse.json({
      items,
      filters: {
        types: allTypes,
      },
    })
  } catch (error) {
    console.error("Error fetching content:", error)
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    )
  }
}
