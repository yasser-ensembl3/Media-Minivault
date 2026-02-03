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
    const response = await fetch(fileUrl)

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
