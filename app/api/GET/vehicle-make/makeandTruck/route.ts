import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
// import { cookies } from 'next/headers';
export async function GET(request: NextRequest) {
  // Get token using the standard request
  const tokeninfo = await getToken({ req: request });
  const token = tokeninfo?.idToken;
  console.log('Token:', token); // Log token to check if it exists

  if (!token) {
    return Response.json({ error: 'No token found' }, { status: 401 });
  }

  const res = await fetch(`${process.env.URLB}/vehicleMake/get?make=Tundra&model=Truck`, {
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, 
    },
  });

  const product = await res.json();
  console.log('Product:', product); // Log product to check if it's retrieved successfully
  return Response.json( product );
}
