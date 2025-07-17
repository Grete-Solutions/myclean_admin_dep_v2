import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

// Define the bin type interface
interface BinType {
  binType: string
  capacity: number
  price: number
  equivalentBags: string
  isActive: boolean
  imageUrl: string
}

// Define the interface for the service location data
// Aligned with POST route's expectations
interface ServiceLocationData {
  city: string
  price: number
  isActive: boolean
  countryISOCode: string
  commission: number // Now strictly number
  coordinates: [number, number][] // Now strictly [number, number][]
  bins: BinType[]
  radius: number // Now strictly number
}

export async function PUT(req: NextRequest) {
  // Log the incoming request URL and method
  console.log(`Incoming PUT request to: ${req.url}`)

  try {
    // Get the authentication token
    const tokenInfo = await getToken({ req })
    const token = tokenInfo?.idToken
    if (!token) {
      return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 })
    }

    // Get the service ID from the URL query parameters
    const serviceId = req.nextUrl.searchParams.get("id")
    if (!serviceId) {
      return NextResponse.json({ message: "Missing service ID in URL" }, { status: 400 })
    }

    const requestBodyData: ServiceLocationData = await req.json()

    // Log the parsed request body data
    console.log("Parsed incoming request body data:", requestBodyData)

    const { city, price, isActive, countryISOCode, commission, coordinates, bins, radius } = requestBodyData

    // Validate required fields
    if (!city || !countryISOCode || !coordinates || !Array.isArray(bins) || bins.length === 0) {
      return NextResponse.json(
        { message: "Missing required fields: city, countryISOCode, coordinates, and bins are required" },
        { status: 400 },
      )
    }

    // Validate coordinates array
    if (!Array.isArray(coordinates) || coordinates.length < 3) {
      return NextResponse.json({ message: "Coordinates must be an array with at least 3 points" }, { status: 400 })
    }

    // Validate coordinate format (now [latitude, longitude] arrays)
    const isValidCoordinates = coordinates.every(
      (coord) =>
        Array.isArray(coord) && coord.length === 2 && typeof coord[0] === "number" && typeof coord[1] === "number",
    )
    if (!isValidCoordinates) {
      return NextResponse.json(
        { message: "Invalid coordinate format. Each coordinate must be [latitude, longitude]" },
        { status: 400 },
      )
    }

    // Validate numeric fields
    if (typeof price !== "number" || price < 0) {
      return NextResponse.json({ message: "Price must be a non-negative number" }, { status: 400 })
    }

    // Validate commission (now strictly number)
    if (typeof commission !== "number" || commission < 0 || commission > 100) {
      return NextResponse.json({ message: "Commission must be a number between 0 and 100" }, { status: 400 })
    }

    // Validate radius (now strictly number)
    if (typeof radius !== "number" || radius < 0) {
      return NextResponse.json({ message: "Radius must be a non-negative number" }, { status: 400 })
    }

    // Validate boolean field
    if (typeof isActive !== "boolean") {
      return NextResponse.json({ message: "isActive must be a boolean value" }, { status: 400 })
    }

    // Validate bins array
    if (!Array.isArray(bins) || bins.length === 0) {
      return NextResponse.json({ message: "Bins must be a non-empty array" }, { status: 400 })
    }

    // Validate each bin object
    for (const bin of bins) {
      if (!bin || typeof bin !== "object") {
        return NextResponse.json({ message: "Each bin must be an object" }, { status: 400 })
      }
      const requiredBinFields = ["binType", "capacity", "price", "equivalentBags", "isActive", "imageUrl"]
      for (const field of requiredBinFields) {
        if (!(field in bin)) {
          return NextResponse.json({ message: `Missing required bin field: ${field}` }, { status: 400 })
        }
      }
      if (typeof bin.binType !== "string" || bin.binType.trim().length === 0) {
        return NextResponse.json({ message: "bin.binType must be a non-empty string" }, { status: 400 })
      }
      if (typeof bin.capacity !== "number" || bin.capacity < 0) {
        return NextResponse.json({ message: "bin.capacity must be a non-negative number" }, { status: 400 })
      }
      if (typeof bin.price !== "number" || bin.price < 0) {
        return NextResponse.json({ message: "bin.price must be a non-negative number" }, { status: 400 })
      }
      if (typeof bin.isActive !== "boolean") {
        return NextResponse.json({ message: "bin.isActive must be a boolean" }, { status: 400 })
      }
      if (typeof bin.equivalentBags !== "string") {
        return NextResponse.json({ message: "bin.equivalentBags must be a string" }, { status: 400 })
      }
      if (typeof bin.imageUrl !== "string") {
        return NextResponse.json({ message: "bin.imageUrl must be a string" }, { status: 400 })
      }
    }

    // Construct the payload for the backend
    const requestBody = {
      city,
      price,
      isActive,
      countryISOCode,
      commission,
      coordinates, // Send coordinates as [number, number][]
      bins,
      radius,
    }

    const targetUrl = `${process.env.URLB}/location/update/${serviceId}`

    // This console.log already shows the full URL and the request body
    console.log("Sending request to backend:", {
      url: targetUrl, // The full URL including URLB
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token ? token.substring(0, 20) + "..." : "No token"}`,
      },
      body: requestBody, // The data being sent
    })

    const response = await fetch(targetUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        const errorText = await response.text()
        console.error("Backend error (non-JSON):", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          headers: Object.fromEntries(response.headers.entries()),
        })
        return NextResponse.json(
          {
            message: "Failed to update service location",
            error: errorText,
            status: response.status,
            statusText: response.statusText,
          },
          { status: response.status },
        )
      }
      console.error("Backend error:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
        headers: Object.fromEntries(response.headers.entries()),
      })
      return NextResponse.json(
        {
          message: errorData.message || "Failed to update service location",
          error: errorData,
          status: response.status,
          statusText: response.statusText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Catch block error:", {
      error,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      errorStack: error instanceof Error ? error.stack : undefined,
      errorType: typeof error,
      errorConstructor: error?.constructor?.name,
    })
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
          error: error.message,
          stack: error.stack,
          type: "Error",
        },
        { status: 500 },
      )
    } else {
      return NextResponse.json(
        {
          message: "An unexpected error occurred",
          error: String(error),
          type: "Unknown",
        },
        { status: 500 },
      )
    }
  }
}
