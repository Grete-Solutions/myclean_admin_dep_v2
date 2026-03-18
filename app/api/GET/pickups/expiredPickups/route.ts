import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
// import { cookies } from 'next/headers';
export async function GET(request: NextRequest) {
  // Get token using the standard request
  const tokeninfo = await getToken({ req: request });
  const token = tokeninfo?.idToken;

  
  console.log('Token:', token);
  
  if (!token) {
    return Response.json({ error: 'No token found' }, { status: 401 });
  }
  
  const res = await fetch(`${process.env.URLB}/orders?status=expired`, {
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!res.ok) {
    return Response.json({ success: false, error: 'Failed to fetch expired pickups' }, { status: res.status });
  }

  const backendData = await res.json();
  
  const transformedData = (backendData.data || []).map((item: any) => {
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
      actualPrice: item.totalCost || 0,
      netPrice: item.totalCost || 0,
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
  });
}