import { Client } from "@notionhq/client"
import { NextResponse } from "next/server"

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")
  const status = searchParams.get("status")
  const source = searchParams.get("source")
  const search = searchParams.get("search")

  const databaseId = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID

  if (!databaseId) {
    return NextResponse.json(
      { error: "Database ID not configured" },
      { status: 500 }
    )
  }

  try {
    // Build filters
    const filters: Array<{
      property: string
      select?: { equals: string }
      rich_text?: { contains: string }
      title?: { contains: string }
    }> = []

    if (type && type !== "all") {
      filters.push({
        property: "Type",
        select: { equals: type },
      })
    }

    if (status && status !== "all") {
      filters.push({
        property: "Status",
        select: { equals: status },
      })
    }

    if (source && source !== "all") {
      filters.push({
        property: "Source",
        select: { equals: source },
      })
    }

    if (search) {
      filters.push({
        property: "Title",
        title: { contains: search },
      })
    }

    const response = await notion.databases.query({
      database_id: databaseId,
      filter:
        filters.length > 0
          ? {
              and: filters,
            }
          : undefined,
      sorts: [
        {
          property: "Date Added",
          direction: "descending",
        },
      ],
      page_size: 100,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = response.results.map((page: any) => {
      const properties = page.properties

      return {
        id: page.id,
        title:
          properties.Title?.title?.[0]?.plain_text ||
          properties.Name?.title?.[0]?.plain_text ||
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
    const allSources = [...new Set(items.map((item) => item.source).filter(Boolean))]
    const allStatuses = [...new Set(items.map((item) => item.status).filter(Boolean))]

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
