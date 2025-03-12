import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
// import { cookies } from 'next/headers';
export async function GET(request: NextRequest) {
  // Get token using the standard request
  const tokeninfo = await getToken({ req: request });
  const token = tokeninfo?.idToken;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
 
  
  console.log('Token:', token);
  
  if (!token) {
    return Response.json({ error: 'No token found' }, { status: 401 });
  }
  
    const res = await fetch(`${process.env.URLB}/users/get?id=${id}`, {
      cache: 'no-cache',  
      headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,

        },
    });
  
    const product = await res.json();
  
    return Response.json( product );
  }
  