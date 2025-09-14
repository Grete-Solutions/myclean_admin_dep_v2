import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Get token using the standard request
  const tokeninfo = await getToken({ req: request });
  const token = tokeninfo?.idToken;
 
  console.log('Token:', token);
 
  if (!token) {
    return Response.json({ error: 'No token found' }, { status: 401 });
  }
 
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  try {
    const res = await fetch(`${process.env.URLB}/location/get?id=${id}`, {
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  
    console.log('Response Status:', res.status);
  
    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`);
    }
  
    const data = await res.json();
    console.log('Fetched Data:', data);
    console.log('Data structure:', {
      hasData: !!data.data,
      dataType: typeof data.data,
      isArray: Array.isArray(data.data),
      dataLength: Array.isArray(data.data) ? data.data.length : 'N/A'
    });
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return Response.json({ error: 'Failed to fetch admin data' }, { status: 500 });
  }
  
  
}