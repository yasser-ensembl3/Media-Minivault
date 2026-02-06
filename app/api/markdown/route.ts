import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const fileUrl = searchParams.get("url")

  if (!fileUrl) {
    return NextResponse.json(
      { error: "URL is required" },
      { status: 400 }
    )
  }

  try {
    // Convert Google Drive view URLs to direct download URLs
    let url = fileUrl
    const driveMatch = fileUrl.match(/drive\.google\.com\/file\/d\/([^/]+)/)
    if (driveMatch) {
      url = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`
    }

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error("Failed to fetch markdown file")
    }

    const content = await response.text()

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error fetching markdown:", error)
    return NextResponse.json(
      { error: "Failed to fetch markdown content" },
      { status: 500 }
    )
  }
}
