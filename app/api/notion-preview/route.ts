import { NextResponse } from "next/server"

const NOTION_TOKEN = process.env.NOTION_TOKEN

// Extract page ID from Notion URL
function extractPageId(url: string): string | null {
  // Handle various Notion URL formats
  // https://www.notion.so/workspace/Page-Title-abc123def456
  // https://www.notion.so/abc123def456
  // https://notion.site/Page-Title-abc123def456

  const patterns = [
    /notion\.so\/(?:[^/]+\/)?(?:[^-]+-)?([a-f0-9]{32})/i,
    /notion\.site\/(?:[^-]+-)?([a-f0-9]{32})/i,
    /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
    /([a-f0-9]{32})/i,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      // Format ID with dashes if needed
      const id = match[1].replace(/-/g, "")
      if (id.length === 32) {
        return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`
      }
      return match[1]
    }
  }
  return null
}

// Convert Notion blocks to simple HTML
function blocksToHtml(blocks: any[]): string {
  return blocks.map(block => {
    const type = block.type
    const content = block[type]

    switch (type) {
      case "paragraph":
        const text = richTextToHtml(content.rich_text)
        return text ? `<p class="mb-3">${text}</p>` : '<p class="mb-3">&nbsp;</p>'

      case "heading_1":
        return `<h1 class="text-2xl font-bold mb-4 mt-6">${richTextToHtml(content.rich_text)}</h1>`

      case "heading_2":
        return `<h2 class="text-xl font-bold mb-3 mt-5">${richTextToHtml(content.rich_text)}</h2>`

      case "heading_3":
        return `<h3 class="text-lg font-bold mb-2 mt-4">${richTextToHtml(content.rich_text)}</h3>`

      case "bulleted_list_item":
        return `<li class="ml-4 mb-1">• ${richTextToHtml(content.rich_text)}</li>`

      case "numbered_list_item":
        return `<li class="ml-4 mb-1">${richTextToHtml(content.rich_text)}</li>`

      case "to_do":
        const checked = content.checked ? "☑" : "☐"
        return `<div class="mb-1">${checked} ${richTextToHtml(content.rich_text)}</div>`

      case "toggle":
        return `<details class="mb-2"><summary class="cursor-pointer">${richTextToHtml(content.rich_text)}</summary></details>`

      case "quote":
        return `<blockquote class="border-l-4 border-zinc-600 pl-4 italic my-3">${richTextToHtml(content.rich_text)}</blockquote>`

      case "callout":
        const icon = content.icon?.emoji || "💡"
        return `<div class="bg-zinc-800 rounded p-3 mb-3 flex gap-2"><span>${icon}</span><span>${richTextToHtml(content.rich_text)}</span></div>`

      case "code":
        return `<pre class="bg-zinc-800 rounded p-3 mb-3 overflow-x-auto text-sm"><code>${richTextToHtml(content.rich_text)}</code></pre>`

      case "divider":
        return `<hr class="border-zinc-700 my-4" />`

      case "image":
        const imgUrl = content.file?.url || content.external?.url
        return imgUrl ? `<img src="${imgUrl}" alt="" class="max-w-full rounded mb-3" />` : ""

      case "bookmark":
        return `<a href="${content.url}" target="_blank" class="text-blue-400 hover:underline block mb-2">${content.url}</a>`

      case "link_preview":
        return `<a href="${content.url}" target="_blank" class="text-blue-400 hover:underline block mb-2">${content.url}</a>`

      case "child_database":
        return `<div class="bg-zinc-800 rounded p-3 mb-3 text-zinc-400">📊 Database: ${content.title || "Untitled"}</div>`

      case "child_page":
        return `<div class="bg-zinc-800 rounded p-3 mb-3 text-zinc-400">📄 Page: ${content.title || "Untitled"}</div>`

      default:
        return ""
    }
  }).join("")
}

function richTextToHtml(richText: any[]): string {
  if (!richText || richText.length === 0) return ""

  return richText.map(item => {
    let text = item.plain_text || ""
    const annotations = item.annotations || {}

    // Escape HTML
    text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

    // Apply annotations
    if (annotations.bold) text = `<strong>${text}</strong>`
    if (annotations.italic) text = `<em>${text}</em>`
    if (annotations.strikethrough) text = `<del>${text}</del>`
    if (annotations.underline) text = `<u>${text}</u>`
    if (annotations.code) text = `<code class="bg-zinc-700 px-1 rounded">${text}</code>`

    // Handle links
    if (item.href) {
      text = `<a href="${item.href}" target="_blank" class="text-blue-400 hover:underline">${text}</a>`
    }

    return text
  }).join("")
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "URL required" }, { status: 400 })
  }

  const pageId = extractPageId(url)
  if (!pageId) {
    return NextResponse.json({ error: "Invalid Notion URL" }, { status: 400 })
  }

  try {
    // Get page info
    const pageResponse = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
      },
    })

    if (!pageResponse.ok) {
      const error = await pageResponse.json()
      throw new Error(error.message || "Failed to fetch page")
    }

    const page = await pageResponse.json()

    // Get page title
    let title = "Untitled"
    const titleProp = page.properties?.title || page.properties?.Name
    if (titleProp?.title?.[0]?.plain_text) {
      title = titleProp.title[0].plain_text
    }

    // Get page blocks (content)
    const blocksResponse = await fetch(
      `https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`,
      {
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28",
        },
      }
    )

    if (!blocksResponse.ok) {
      const error = await blocksResponse.json()
      throw new Error(error.message || "Failed to fetch blocks")
    }

    const blocksData = await blocksResponse.json()
    const html = blocksToHtml(blocksData.results)

    return NextResponse.json({
      title,
      html,
      icon: page.icon?.emoji || null,
      cover: page.cover?.external?.url || page.cover?.file?.url || null,
    })
  } catch (error) {
    console.error("Error fetching Notion page:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch page" },
      { status: 500 }
    )
  }
}
