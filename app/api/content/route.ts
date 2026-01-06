import { NextResponse } from "next/server"

const NOTION_TOKEN = process.env.NOTION_TOKEN
const DATABASE_ID = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID

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
        sorts: [{ property: "Date Added", direction: "descending" }],
        page_size: 100,
      }),
      next: { revalidate: 60 }, // Cache for 60 seconds
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
  const status = searchParams.get("status")
  const source = searchParams.get("source")
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
      filters.push({ property: "Type", select: { equals: type } })
    }

    if (status && status !== "all") {
      filters.push({ property: "Status", select: { equals: status } })
    }

    if (source && source !== "all") {
      filters.push({ property: "Source", select: { equals: source } })
    }

    if (search) {
      filters.push({ property: "Name", title: { contains: search } })
    }

    const response = await queryNotionDatabase(filters)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = response.results.map((page: any) => {
      const properties = page.properties

      return {
        id: page.id,
        title:
          properties.Name?.title?.[0]?.plain_text ||
          properties.Title?.title?.[0]?.plain_text ||
          "Untitled",
        url: properties.URL?.url || null,
        type: properties.Type?.select?.name || null,
        source: properties.Source?.select?.name || null,
        status: properties.Status?.select?.name || "Inbox",
        dateAdded: properties["Date Added"]?.date?.start || page.created_time,
        tags:
          properties.Tags?.multi_select?.map(
            (tag: { name: string }) => tag.name
          ) || [],
        priority: properties.Priority?.select?.name || null,
        notes: properties.Notes?.rich_text?.[0]?.plain_text || null,
        notionUrl: page.url,
      }
    })

    // Get unique values for filters
    const allTypes = [...new Set(items.map((item) => item.type).filter(Boolean))]
    const allSources = [
      ...new Set(items.map((item) => item.source).filter(Boolean)),
    ]
    const allStatuses = [
      ...new Set(items.map((item) => item.status).filter(Boolean)),
    ]

    return NextResponse.json({
      items,
      filters: {
        types: allTypes,
        sources: allSources,
        statuses: allStatuses,
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
