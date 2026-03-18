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
    const res = await fetch(`${process.env.URLB}/orders?limit=400`, {
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      console.error(`Backend API error: ${res.status} ${res.statusText}`);
      const errorText = await res.text();
      console.error(`Error body: ${errorText}`);
      throw new Error(`API request failed with status: ${res.status}`);
    }

    const backendData = await res.json()
    console.log("Backend response for getallpickups:", JSON.stringify(backendData).slice(0, 500));
    
    // Transform data to match frontend expectations
    // Handle cases where data might be at top level or under .data or .orders
    const rawData = Array.isArray(backendData) ? backendData : (backendData.data || backendData.orders || []);
    
    const transformedData = rawData.map((item: Record<string, unknown>) => {
      let createdAt = item.createdAt;
      if (typeof item.createdAt === 'string') {
        const date = new Date(item.createdAt);
        createdAt = {
          _seconds: Math.floor(date.getTime() / 1000),
          _nanoseconds: (date.getTime() % 1000) * 1e6
        };
      } else if (item.pickupDate) {
        createdAt = item.pickupDate;
      }

      return {
        ...item,
        actualPrice: item.totalCost || item.actualPrice || 0,
        netPrice: item.totalCost || item.netPrice || 0,
        createdAt: createdAt,
        vehicleLicenseNumber: item.vehicleLicenseNumber || "N/A",
      };
    });

    return Response.json({
      success: true,
      message: "Data fetched successfully",
      status: 200,
      count: transformedData.length,
      data: transformedData
    })
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
