"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"

interface Booking {
  id: string
  address: string
  pickupLocation: {
    _latitude: number
    _longitude: number
  }
  totalCost: number
  netCost: number
  status: string
}

interface ApiResponse {
  success: boolean
  message: string
  status: number
  count: number
  data: Booking[]
}

interface RegionData {
  name: string
  value: number
  color: string
  count: number
  percentage: number
}

export const PickupsByRegion = () => {
  const [regionData, setRegionData] = useState<RegionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [totalBookings, setTotalBookings] = useState(0)

  const getRegionFromCoordinates = (lat: number, lng: number): string => {
    // Validate coordinates first
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return "Unknown"
    }

    // More accurate region mapping for Ghana
    // Greater Accra region (around Accra) - more precise boundaries
    if (lat >= 5.2 && lat <= 5.9 && lng >= -0.6 && lng <= 0.3) {
      return "Greater Accra"
    }
    // Ashanti region (around Kumasi) - refined boundaries
    if (lat >= 6.0 && lat <= 7.5 && lng >= -2.8 && lng <= -0.5) {
      return "Ashanti"
    }
    // Western region - better coverage
    if (lat >= 4.2 && lat <= 6.8 && lng >= -3.8 && lng <= -1.2) {
      return "Western"
    }
    // Northern region - expanded coverage
    if (lat >= 8.0 && lat <= 11.0 && lng >= -3.2 && lng <= 0.8) {
      return "Northern"
    }
    // Eastern region - refined boundaries
    if (lat >= 5.7 && lat <= 7.8 && lng >= -1.2 && lng <= 1.2) {
      return "Eastern"
    }
    // Central region
    if (lat >= 5.0 && lat <= 6.0 && lng >= -2.5 && lng <= -0.5) {
      return "Central"
    }
    // Volta region
    if (lat >= 5.8 && lat <= 8.5 && lng >= -0.2 && lng <= 1.8) {
      return "Volta"
    }
    // Upper East region
    if (lat >= 10.0 && lat <= 11.2 && lng >= -1.5 && lng <= 0.5) {
      return "Upper East"
    }
    // Upper West region
    if (lat >= 9.5 && lat <= 11.0 && lng >= -3.0 && lng <= -1.5) {
      return "Upper West"
    }
    // Brong-Ahafo region
    if (lat >= 6.5 && lat <= 9.0 && lng >= -3.5 && lng <= -0.8) {
      return "Brong-Ahafo"
    }

    // If coordinates don't match any region, return Unknown instead of defaulting
    return "Unknown"
  }

  const processBookingsData = (bookings: Booking[]): RegionData[] => {
    // Filter out cancelled bookings and validate data
    const validBookings = bookings.filter((booking) => {
      return (
        booking.status !== "cancelled" &&
        booking.pickupLocation &&
        typeof booking.pickupLocation._latitude === "number" &&
        typeof booking.pickupLocation._longitude === "number" &&
        booking.totalCost > 0
      )
    })

    const regionMap = new Map<string, { totalCost: number; count: number }>()

    validBookings.forEach((booking) => {
      const region = getRegionFromCoordinates(booking.pickupLocation._latitude, booking.pickupLocation._longitude)

      const existing = regionMap.get(region) || { totalCost: 0, count: 0 }
      regionMap.set(region, {
        totalCost: existing.totalCost + booking.totalCost,
        count: existing.count + 1,
      })
    })

    // Enhanced color palette with better contrast
    const colors = [
      "#3b82f6", // Blue
      "#10b981", // Emerald
      "#f59e0b", // Amber
      "#ef4444", // Red
      "#8b5cf6", // Violet
      "#06b6d4", // Cyan
      "#84cc16", // Lime
      "#f97316", // Orange
      "#ec4899", // Pink
      "#6b7280", // Gray
    ]
    let colorIndex = 0

    const totalRevenue = Array.from(regionMap.values()).reduce((sum, data) => sum + data.totalCost, 0)

    return Array.from(regionMap.entries())
      .map(([name, data]) => ({
        name,
        value: data.totalCost,
        count: data.count,
        color: colors[colorIndex++ % colors.length],
        percentage: totalRevenue > 0 ? (data.totalCost / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value) // Sort by total cost descending
  }

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/GET/pickups/getallpickups")

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const apiResponse: ApiResponse = await response.json()

        if (apiResponse.success && apiResponse.data) {
          const processedData = processBookingsData(apiResponse.data)
          setRegionData(processedData)

          const totalValue = processedData.reduce((sum, item) => sum + item.value, 0)
          const totalCount = processedData.reduce((sum, item) => sum + item.count, 0)
          setTotal(totalValue)
          setTotalBookings(totalCount)
        } else {
          throw new Error(apiResponse.message || "Failed to fetch bookings")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("Error fetching bookings:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <div className="flex justify-between items-center p-4">
          <CardTitle className="text-lg">Pickups by Service Area</CardTitle>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading regional data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="overflow-hidden">
        <div className="flex justify-between items-center p-4">
          <CardTitle className="text-lg">Pickups by Service Area</CardTitle>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-32">
            <div className="text-destructive">Error: {error}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex justify-between items-center p-4">
        <CardTitle className="text-lg">Pickups by Service Area</CardTitle>
        <div className="flex space-x-2">
          <button className="p-1 hover:bg-muted rounded">
            <span className="sr-only">Download</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
          <button className="p-1 hover:bg-muted rounded">
            <span className="sr-only">More</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
        </div>
      </div>
      <CardContent className="p-0">
        <div className="flex">
          <div className="w-1/2 p-4 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-3xl font-bold">
                GH₵{total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-muted-foreground text-sm">Total Revenue</p>
              <p className="text-xs text-muted-foreground mt-1">{totalBookings} completed pickups</p>
            </div>
          </div>
          <div className="w-1/2 p-4">
            <ul className="space-y-2">
              {regionData.map((item) => (
                <li key={item.name} className="flex justify-between">
                  <div className="flex items-center">
                    <span className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      GH₵{item.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.count} pickup{item.count !== 1 ? "s" : ""} ({item.percentage.toFixed(1)}%)
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
