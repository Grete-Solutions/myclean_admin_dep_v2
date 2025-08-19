import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  // Get token using the standard request
  const tokeninfo = await getToken({ req: request })
  const token = tokeninfo?.idToken

  console.log("Token:", token)

  if (!token) {
    return Response.json({ error: "No token found" }, { status: 401 })
  }

  try {
    const res = await fetch(`${process.env.URLB}/booking/get?limit=400&&status=completed`, {
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      throw new Error(`API request failed with status: ${res.status}`)
    }

    const data = await res.json()
    console.log("Data fetched successfully, count:", data)

    return Response.json(data)
  } catch (error) {
    console.error("Error fetching pickups:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to fetch pickup data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
